import React, { useState, useEffect, useMemo } from 'react';
import {
  TravelPlace,
  FilterOptions,
  SupabaseConfigStatus,
  TravelTrip,
  TravelReviewLog,
  TravelExpense,
  PlaceReport,
  UserProfile,
  ReportStatus,
  ServiceGroupInfo,
  TravelCity,
} from './types';
import {
  fetchPlacesFromSupabase,
  fetchGroupsFromSupabase,
  loadLocalGroups,
  fetchCitiesFromSupabase,
  loadLocalCities,
  saveLocalCities,
  getSupabaseClient,
  upsertPlaceToSupabase,
  bulkUpsertPlacesToSupabase,
  softDeletePlaceInSupabase,
  checkSupabaseStatus,
  fetchTripsFromSupabase,
  upsertTripToSupabase,
  deleteTripInSupabase,
  fetchReviewsFromSupabase,
  upsertReviewToSupabase,
  deleteReviewInSupabase,
  fetchExpensesFromSupabase,
  upsertExpenseToSupabase,
  deleteExpenseInSupabase,
  fetchReportsFromSupabase,
  submitPlaceReport,
  updateReportStatusInDb,
  deleteReportInDb,
} from './lib/supabase';
import { getCurrentUser, canAddPlace } from './lib/auth';
import { applyUserDistance, filterAndSortPlaces, DEFAULT_CITIES } from './lib/geoUtils';
import { Navbar } from './components/Navbar';
import { TravelList } from './components/TravelList';
import { TravelMapView } from './components/TravelMapView';
import { TravelDetailModal } from './components/TravelDetailModal';
import { TravelFormModal } from './components/TravelFormModal';
import { ImportExportModal } from './components/ImportExportModal';
import { SupabaseModal } from './components/SupabaseModal';
import { TripPlannerModal } from './components/TripPlannerModal';
import { ReviewLogModal } from './components/ReviewLogModal';
import { ExpenseModal } from './components/ExpenseModal';
import { AuthModal } from './components/AuthModal';
import { ReportPlaceModal } from './components/ReportPlaceModal';
import { AdminReportManagerModal } from './components/AdminReportManagerModal';
import { TravelReportModal } from './components/TravelReportModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminUserManagerModal } from './components/AdminUserManagerModal';
import { Map as MapIcon, List, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [places, setPlaces] = useState<TravelPlace[]>([]);
  const [groups, setGroups] = useState<ServiceGroupInfo[]>(() => loadLocalGroups());
  const [cities, setCities] = useState<TravelCity[]>(() => loadLocalCities());
  const [trips, setTrips] = useState<TravelTrip[]>([]);
  const [reviews, setReviews] = useState<TravelReviewLog[]>([]);
  const [expenses, setExpenses] = useState<TravelExpense[]>([]);
  const [reports, setReports] = useState<PlaceReport[]>([]);

  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    group: 'all',
    status: 'all',
    sortBy: 'rating',
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; timestamp?: number } | null>(null);
  const [hasUserLocation, setHasUserLocation] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus | null>(null);

  // Mobile View Switch: 'list' | 'map'
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('map');

  // Modals state
  const [detailPlace, setDetailPlace] = useState<TravelPlace | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedPlaceForReview, setSelectedPlaceForReview] = useState<TravelPlace | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isTravelReportModalOpen, setIsTravelReportModalOpen] = useState<boolean>(false);

  // Auth, Profile & Reporting Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState<boolean>(false);
  const [isAdminUserModalOpen, setIsAdminUserModalOpen] = useState<boolean>(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>(undefined);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportingPlace, setReportingPlace] = useState<TravelPlace | null>(null);
  const [isAdminReportModalOpen, setIsAdminReportModalOpen] = useState<boolean>(false);

  const [formPlace, setFormPlace] = useState<{ isOpen: boolean; data: TravelPlace | null }>({
    isOpen: false,
    data: null,
  });

  // Load data & verify Supabase connection on mount and user switch
  const loadData = async (userToLoad = currentUser) => {
    setIsLoading(true);
    try {
      // 1. Check Supabase connection
      const status = await checkSupabaseStatus();
      setSupabaseStatus(status);

      // User isolation strategy:
      // - Admin: sees all trips, reviews, expenses (pass undefined)
      // - User: sees ONLY their own trips, reviews, expenses (pass userToLoad.id)
      // - Viewer / Unauthenticated: isolated from personal data (pass special no-access key so empty array returns)
      let isolatedUserId: string | undefined;
      if (!userToLoad || userToLoad.role === 'viewer') {
        isolatedUserId = '__guest_no_personal_data__';
      } else if (userToLoad.role === 'admin') {
        isolatedUserId = undefined; // Admin has full visibility
      } else {
        isolatedUserId = userToLoad.id;
      }

      // 2. Fetch places, groups, cities, trips, reviews, expenses, reports in parallel
      const [placesData, groupsData, citiesData, tripsData, reviewsData, expensesData, reportsData] = await Promise.all([
        fetchPlacesFromSupabase(),
        fetchGroupsFromSupabase(),
        fetchCitiesFromSupabase(),
        fetchTripsFromSupabase(isolatedUserId),
        fetchReviewsFromSupabase(undefined, isolatedUserId === '__guest_no_personal_data__' ? undefined : isolatedUserId),
        fetchExpensesFromSupabase(isolatedUserId),
        fetchReportsFromSupabase(),
      ]);

      setPlaces(placesData);
      setGroups(groupsData);
      setCities(citiesData);
      setTrips(tripsData);
      setReviews(reviewsData);
      setExpenses(expensesData);
      setReports(reportsData);

      if (placesData.length > 0 && !selectedPlace) {
        setSelectedPlace(placesData[0]);
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentUser);
  }, [currentUser?.id, currentUser?.role]);

  // Pending reports count for admin notification
  const pendingReportsCount = useMemo(() => {
    return reports.filter((r) => r.status === 'pending').length;
  }, [reports]);

  // Update distance calculations when userLocation or places change
  const placesWithDistance = useMemo(() => {
    if (userLocation) {
      return applyUserDistance(places, userLocation.lat, userLocation.lng);
    }
    return places;
  }, [places, userLocation]);

  // Filter and sort places list
  const filteredPlaces = useMemo(() => {
    return filterAndSortPlaces(placesWithDistance, filters);
  }, [placesWithDistance, filters]);

  // Visited & Favorite counters
  const visitedCount = useMemo(() => {
    return places.filter((p) => p.checked).length;
  }, [places]);

  const favoriteCount = useMemo(() => {
    return places.filter((p) => p.isFavorite).length;
  }, [places]);

  // Get user GPS location & Zoom to it
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng, timestamp: Date.now() });
        setHasUserLocation(true);
        setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
        setMobileTab('map');
      },
      (err) => {
        alert(`Không thể lấy vị trí: ${err.message}. Vui lòng cấp quyền truy cập vị trí.`);
      },
      { enableHighAccuracy: true }
    );
  };

  // Open Add Place with RBAC check
  const handleOpenAddPlace = () => {
    if (!canAddPlace(currentUser)) {
      setAuthPromptMessage(
        'Bạn đang duyệt với tư cách Khách xem (Viewer). Vui lòng Đăng Nhập hoặc Đăng Ký tài khoản Thành Viên (User) để được thêm địa điểm du lịch tùy ý lên bản đồ!'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setFormPlace({ isOpen: true, data: null });
  };

  // Toggle Checked / Check-in status directly
  const handleToggleChecked = async (id: string, currentChecked: boolean) => {
    if (!currentUser || currentUser.role === 'viewer') {
      setAuthPromptMessage('Khách xem chỉ có quyền xem dữ liệu. Vui lòng Đăng Nhập tài khoản Thành Viên (User) để thực hiện check-in!');
      setIsAuthModalOpen(true);
      return;
    }
    const newChecked = !currentChecked;
    const newVisitedAt = newChecked ? new Date().toISOString() : null;

    const targetPlace = places.find((p) => p.id === id);
    if (!targetPlace) return;

    const updatedPlace: TravelPlace = {
      ...targetPlace,
      checked: newChecked,
      visitedAt: newVisitedAt,
    };

    setPlaces((prev) => prev.map((p) => (p.id === id ? updatedPlace : p)));
    if (selectedPlace?.id === id) setSelectedPlace(updatedPlace);
    if (detailPlace?.id === id) setDetailPlace(updatedPlace);

    await upsertPlaceToSupabase(updatedPlace);
  };

  // Toggle Favorite status directly
  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    if (!currentUser || currentUser.role === 'viewer') {
      setAuthPromptMessage('Khách xem chỉ có quyền xem dữ liệu. Vui lòng Đăng Nhập tài khoản Thành Viên (User) để lưu địa điểm yêu thích!');
      setIsAuthModalOpen(true);
      return;
    }
    const newFavorite = !currentFavorite;
    const targetPlace = places.find((p) => p.id === id);
    if (!targetPlace) return;

    const updatedPlace: TravelPlace = {
      ...targetPlace,
      isFavorite: newFavorite,
    };

    setPlaces((prev) => prev.map((p) => (p.id === id ? updatedPlace : p)));
    if (selectedPlace?.id === id) setSelectedPlace(updatedPlace);
    if (detailPlace?.id === id) setDetailPlace(updatedPlace);

    await upsertPlaceToSupabase(updatedPlace);
  };

  // Save / Add / Edit Place (Users can freely add places without verification!)
  const handleSavePlace = async (placeToSave: TravelPlace) => {
    setPlaces((prev) => {
      const idx = prev.findIndex((p) => p.id === placeToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = placeToSave;
        return copy;
      }
      return [placeToSave, ...prev];
    });

    setSelectedPlace(placeToSave);
    await upsertPlaceToSupabase(placeToSave);
  };

  // Delete Place (Admin or authorized)
  const handleDeletePlace = async (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlace?.id === id) setSelectedPlace(null);
    if (detailPlace?.id === id) setDetailPlace(null);
    await softDeletePlaceInSupabase(id);
  };

  // Save Trip
  const handleSaveTrip = async (trip: TravelTrip) => {
    setTrips((prev) => {
      const idx = prev.findIndex((t) => t.id === trip.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = trip;
        return copy;
      }
      return [trip, ...prev];
    });
    await upsertTripToSupabase(trip);
  };

  // Delete Trip
  const handleDeleteTrip = async (tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    await deleteTripInSupabase(tripId);
  };

  // Save Review
  const handleSaveReview = async (review: TravelReviewLog) => {
    setReviews((prev) => [review, ...prev]);
    await upsertReviewToSupabase(review);
  };

  // Delete Review
  const handleDeleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await deleteReviewInSupabase(id);
  };

  // Save Expense
  const handleSaveExpense = async (expense: TravelExpense) => {
    setExpenses((prev) => [expense, ...prev]);
    await upsertExpenseToSupabase(expense);
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteExpenseInSupabase(id);
  };

  // Submit Place Report (Users or Admin)
  const handleSubmitReport = async (report: PlaceReport) => {
    setReports((prev) => [report, ...prev]);
    await submitPlaceReport(report);
  };

  // Admin: Update Report Status (Resolve / Dismiss)
  const handleUpdateReportStatus = async (reportId: string, status: ReportStatus, adminNote?: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status,
              adminNote: adminNote !== undefined ? adminNote : r.adminNote,
              resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : r.resolvedAt,
            }
          : r
      )
    );
    await updateReportStatusInDb(reportId, status, adminNote);
  };

  // Admin: Delete Report Record
  const handleDeleteReport = async (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    await deleteReportInDb(reportId);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        totalCount={places.length}
        visitedCount={visitedCount}
        favoriteCount={favoriteCount}
        filteredCount={filteredPlaces.length}
        tripsCount={trips.length}
        reviewsCount={reviews.length}
        pendingReportsCount={pendingReportsCount}
        currentUser={currentUser}
        supabaseStatus={supabaseStatus}
        isLoading={isLoading}
        onRefreshData={loadData}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAddModal={handleOpenAddPlace}
        onOpenTripModal={() => setIsTripModalOpen(true)}
        onOpenReviewModal={() => {
          setSelectedPlaceForReview(null);
          setIsReviewModalOpen(true);
        }}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenTravelReportModal={() => setIsTravelReportModalOpen(true)}
        onOpenAuthModal={() => {
          setAuthPromptMessage(undefined);
          setIsAuthModalOpen(true);
        }}
        onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
        onOpenAdminUserModal={() => setIsAdminUserModalOpen(true)}
        onOpenAdminReportModal={() => setIsAdminReportModalOpen(true)}
        onGetUserLocation={handleGetUserLocation}
        hasUserLocation={hasUserLocation}
      />

      {/* Supabase Notice Banner if tables not created yet */}
      {supabaseStatus?.isConnected && !supabaseStatus?.tableExists && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Đã kết nối Supabase! Vui lòng khởi tạo các bảng quan hệ bằng Script SQL (travel_groups, travel_locations, travel_reports, travel_trips...).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition cursor-pointer"
          >
            Xem Script SQL
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Left Sidebar / Mobile List View */}
        <div
          className={`w-full lg:w-[380px] lg:w-[430px] h-full shrink-0 ${
            mobileTab === 'list' ? 'block' : 'hidden lg:block'
          }`}
        >
          <TravelList
            places={filteredPlaces}
            allPlaces={placesWithDistance}
            selectedPlace={selectedPlace}
            filters={filters}
            groups={groups}
            onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            onSelectPlace={(place) => {
              setSelectedPlace(place);
              setMobileTab('map');
            }}
            onToggleChecked={handleToggleChecked}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetailModal={(place) => setDetailPlace(place)}
            onEditPlace={(place) => {
              if (currentUser?.role === 'viewer') {
                setAuthPromptMessage('Khách xem (Viewer) không có quyền chỉnh sửa. Vui lòng đăng nhập với vai trò User hoặc Admin.');
                setIsAuthModalOpen(true);
                return;
              }
              setFormPlace({ isOpen: true, data: place });
            }}
            onDeletePlace={handleDeletePlace}
          />
        </div>

        {/* Right Google Maps View */}
        <div className={`flex-1 h-full relative ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
          <TravelMapView
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={(place) => setSelectedPlace(place)}
            onToggleChecked={handleToggleChecked}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetailModal={(place) => setDetailPlace(place)}
            userLocation={userLocation}
            onGetUserLocation={handleGetUserLocation}
          />
        </div>

      </div>

      {/* Mobile Full-Width Bottom Navigation Bar (Flat, Light Translucent Glass) */}
      <div 
        id="mobile-bottom-nav-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-30 bg-white/80 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] grid grid-cols-2 select-none"
      >
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`py-3 px-2 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer border-r border-slate-200/70 active:bg-slate-100/60 ${
            mobileTab === 'map'
              ? 'text-teal-700 bg-teal-50/70 border-b-2 border-b-teal-600 font-extrabold'
              : 'text-slate-600 hover:text-slate-900 border-b-2 border-b-transparent hover:bg-white/50'
          }`}
        >
          <MapIcon className={`w-4 h-4 transition-transform ${mobileTab === 'map' ? 'text-teal-600 scale-105' : 'text-slate-500'}`} />
          <span>Bản đồ</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`py-3 px-2 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer active:bg-slate-100/60 ${
            mobileTab === 'list'
              ? 'text-teal-700 bg-teal-50/70 border-b-2 border-b-teal-600 font-extrabold'
              : 'text-slate-600 hover:text-slate-900 border-b-2 border-b-transparent hover:bg-white/50'
          }`}
        >
          <List className={`w-4 h-4 transition-transform ${mobileTab === 'list' ? 'text-teal-600 scale-105' : 'text-slate-500'}`} />
          <span>Danh sách</span>
          <span
            className={`px-1.5 py-0.5 rounded-sm text-[11px] font-bold ${
              mobileTab === 'list'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {filteredPlaces.length}
          </span>
        </button>
      </div>

      {/* Place Detail Modal */}
      <TravelDetailModal
        place={detailPlace}
        currentUser={currentUser}
        onClose={() => setDetailPlace(null)}
        onToggleChecked={handleToggleChecked}
        onToggleFavorite={handleToggleFavorite}
        onEditPlace={(place) => setFormPlace({ isOpen: true, data: place })}
        onDeletePlace={handleDeletePlace}
        onOpenReviewModal={(place) => {
          setSelectedPlaceForReview(place);
          setIsReviewModalOpen(true);
        }}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenTripModal={() => setIsTripModalOpen(true)}
        onOpenReportModal={(place) => {
          setReportingPlace(place);
          setIsReportModalOpen(true);
        }}
        onRequireAuth={(msg) => {
          setAuthPromptMessage(msg);
          setIsAuthModalOpen(true);
        }}
        onViewOnMap={(place) => {
          setSelectedPlace(place);
          setMobileTab('map');
        }}
      />

      {/* Report Place Modal */}
      <ReportPlaceModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportingPlace(null);
        }}
        place={reportingPlace}
        currentUser={currentUser}
        onSubmitReport={handleSubmitReport}
      />

      {/* Admin Report Manager Modal */}
      <AdminReportManagerModal
        isOpen={isAdminReportModalOpen}
        onClose={() => setIsAdminReportModalOpen(false)}
        reports={reports}
        places={places}
        currentUser={currentUser}
        onUpdateReportStatus={handleUpdateReportStatus}
        onDeleteReport={handleDeleteReport}
        onEditPlace={(place) => setFormPlace({ isOpen: true, data: place })}
        onDeletePlace={handleDeletePlace}
        onSelectPlaceOnMap={(place) => {
          setSelectedPlace(place);
          setMobileTab('map');
        }}
      />

      {/* Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(updatedUser) => setCurrentUser(updatedUser)}
        promptMessage={authPromptMessage}
      />

      {/* User Profile Management Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
        onLogout={() => {
          const guestUser: UserProfile = {
            id: 'viewer-guest',
            name: 'Khách Xem',
            email: 'guest@travelmaps.vn',
            role: 'viewer',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(guestUser);
          setIsUserProfileModalOpen(false);
        }}
        placesCount={places.length}
        visitedCount={places.filter((p) => p.isChecked).length}
        favoriteCount={places.filter((p) => p.isFavorite).length}
        tripsCount={trips.length}
        expensesCount={expenses.length}
        onOpenAdminUserModal={() => setIsAdminUserModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />

      {/* Admin User Management Modal */}
      <AdminUserManagerModal
        isOpen={isAdminUserModalOpen}
        onClose={() => setIsAdminUserModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Travel Report Modal (User & Admin) */}
      <TravelReportModal
        isOpen={isTravelReportModalOpen}
        onClose={() => setIsTravelReportModalOpen(false)}
        trips={trips}
        places={places}
        expenses={expenses}
        reviews={reviews}
        currentUser={currentUser}
        onSelectPlaceOnMap={(place) => {
          setSelectedPlace(place);
          setMobileTab('map');
        }}
      />

      {/* Trip Planner Modal */}
      <TripPlannerModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        trips={trips}
        places={places}
        expenses={expenses}
        currentUser={currentUser}
        onSaveTrip={handleSaveTrip}
        onDeleteTrip={handleDeleteTrip}
        onSaveExpense={handleSaveExpense}
        onDeleteExpense={handleDeleteExpense}
        onSelectPlaceOnMap={(place) => {
          setSelectedPlace(place);
          setMobileTab('map');
        }}
      />

      {/* Review & Check-in Log Modal */}
      <ReviewLogModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={reviews}
        places={places}
        currentUser={currentUser}
        selectedPlaceForReview={selectedPlaceForReview}
        onSaveReview={handleSaveReview}
        onDeleteReview={handleDeleteReview}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenses={expenses}
        trips={trips}
        places={places}
        currentUser={currentUser}
        onSaveExpense={handleSaveExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* Import / Export JSON & SQL */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        places={places}
        onImport={async (imported, extraData) => {
          // 1. Ensure all referenced cities exist in Supabase FIRST to prevent foreign key errors (23503)
          const citiesMap = new Map<string, TravelCity>();
          DEFAULT_CITIES.forEach((c) => citiesMap.set(c.id, c));
          if (extraData?.cities) {
            extraData.cities.forEach((c) => citiesMap.set(c.id, c));
          }
          imported.forEach((p) => {
            if (p.city_id && !citiesMap.has(p.city_id)) {
              citiesMap.set(p.city_id, {
                id: p.city_id,
                name: p.cityName || p.city_id,
                code: '',
                sort_order: 99,
              });
            }
          });

          const allCities: TravelCity[] = Array.from(citiesMap.values());
          saveLocalCities(allCities);
          setCities(allCities);

          const sb = getSupabaseClient();
          if (sb) {
            try {
              await sb.from('travel_cities').upsert(
                allCities.map((c) => ({
                  id: c.id,
                  name: c.name,
                  code: c.code || '',
                  lat: c.lat || 0,
                  lng: c.lng || 0,
                  sort_order: c.sort_order || 0,
                })),
                { onConflict: 'id' }
              );
            } catch (e) {
              console.warn('Failed to upsert cities in Supabase:', e);
            }
          }

          // 2. Bulk upsert all places with fast batching and fallback
          await bulkUpsertPlacesToSupabase(imported);

          await loadData();
        }}
        onClearAll={async () => {
          setPlaces([]);
          setSelectedPlace(null);
          setDetailPlace(null);
        }}
      />

      {/* Supabase Config Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionUpdated={loadData}
      />

      {/* Add / Edit Place Modal */}
      <TravelFormModal
        isOpen={formPlace.isOpen}
        onClose={() => setFormPlace({ isOpen: false, data: null })}
        initialPlace={formPlace.data}
        onSave={handleSavePlace}
        userLocation={userLocation}
        cities={cities}
      />

    </div>
  );
}

