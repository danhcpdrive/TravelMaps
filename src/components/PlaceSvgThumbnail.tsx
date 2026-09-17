import React from 'react';
import {
  Palmtree,
  Utensils,
  Hotel,
  Sparkles,
  MapPin,
  Coffee,
  Waves,
  Mountain,
  Landmark,
} from 'lucide-react';

interface PlaceSvgThumbnailProps {
  group?: string;
  category?: string;
  name?: string;
  className?: string;
  variant?: 'thumbnail' | 'banner' | 'card';
}

export const PlaceSvgThumbnail: React.FC<PlaceSvgThumbnailProps> = ({
  group = 'du_lich',
  category,
  name = '',
  className = '',
  variant = 'thumbnail',
}) => {
  // Determine solid, vibrant, fresh, youthful flat theme and vector icons based on group & category
  const theme = getYouthfulTheme(group, category);

  // Derive place initials
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || 'VN';

  if (variant === 'banner') {
    return (
      <div
        className={`relative w-full h-full overflow-hidden select-none flex flex-col items-center justify-center ${className}`}
        style={{ backgroundColor: theme.primaryColor }}
      >
        {/* Flat Minimalist Layout - Removed central icon and text as requested by user */}
      </div>
    );
  }

  // Default: Compact Thumbnail Icon for List & Cards (Solid, Minimalist, Borderless)
  return (
    <div
      className={`relative w-full h-full overflow-hidden flex flex-col items-center justify-center select-none ${className}`}
      style={{ backgroundColor: theme.primaryColor }}
      title={name || theme.label}
    >
      {/* Primary Svg Icon & Initials (Flat, Clean, Borderless) */}
      <div className="flex flex-col items-center justify-center" style={{ color: theme.textColor }}>
        {theme.renderIcon('w-5 h-5 text-current')}
        <span className="text-[9px] font-black tracking-wider mt-0.5 uppercase font-sans">
          {initials}
        </span>
      </div>
    </div>
  );
};

// Pure, Solid, Trendy Youthful Pastel-Vibrant colors (Single flat colors, no gradients)
function getYouthfulTheme(group: string, category?: string) {
  const catLower = (category || '').toLowerCase();

  // 1. Cafe & Drinks: Solid Coral Orange (Fresh Orange Peach)
  if (catLower.includes('cafe') || catLower.includes('cà phê') || catLower.includes('trà') || catLower.includes('coffee')) {
    return {
      id: 'cafe',
      label: 'Cà phê & Trà sữa',
      primaryColor: '#FFEAD2', // Soft solid warm peach
      textColor: '#D35400', // Solid burnt orange
      renderIcon: (cls: string) => <Coffee className={cls} />,
    };
  }

  // 2. Food & Dining: Solid Rose Pink (Tasty healthy strawberry blush)
  if (group === 'an_uong' || catLower.includes('quán') || catLower.includes('ăn') || catLower.includes('bánh') || catLower.includes('nướng')) {
    return {
      id: 'an_uong',
      label: 'Ẩm thực & Ăn uống',
      primaryColor: '#FFD3D3', // Soft solid coral rose
      textColor: '#C0392B', // Solid red-coral
      renderIcon: (cls: string) => <Utensils className={cls} />,
    };
  }

  // 3. Stays & Services: Solid Blue Lavender (Relaxed premium sky blue)
  if (group === 'dich_vu' || catLower.includes('khách sạn') || catLower.includes('homestay') || catLower.includes('resort') || catLower.includes('hotel')) {
    return {
      id: 'dich_vu',
      label: 'Nghỉ dưỡng & Homestay',
      primaryColor: '#D6E4FF', // Soft solid lavender blue
      textColor: '#2F54EB', // Solid electric indigo
      renderIcon: (cls: string) => <Hotel className={cls} />,
    };
  }

  // 4. Entertainment & Leisure: Solid Sweet Orchid (Playful neon purple pop)
  if (group === 'giai_tri' || catLower.includes('bar') || catLower.includes('vui chơi') || catLower.includes('công viên') || catLower.includes('cinema')) {
    return {
      id: 'giai_tri',
      label: 'Vui chơi & Giải trí',
      primaryColor: '#F9D6FF', // Soft solid neon orchid
      textColor: '#9C27B0', // Solid deep purple
      renderIcon: (cls: string) => <Sparkles className={cls} />,
    };
  }

  // 5. Beach & Coastal Islands: Solid Marine Aqua (Minty turquoise)
  if (catLower.includes('biển') || catLower.includes('đảo') || catLower.includes('bãi') || catLower.includes('vịnh')) {
    return {
      id: 'beach',
      label: 'Bãi biển & Vịnh đảo',
      primaryColor: '#D1F9F1', // Soft solid sea-glass aqua
      textColor: '#008080', // Solid teal
      renderIcon: (cls: string) => <Waves className={cls} />,
    };
  }

  // 6. Mountains & Forests: Solid Fresh Lime Sage (Soothing matcha garden)
  if (catLower.includes('núi') || catLower.includes('đèo') || catLower.includes('thác') || catLower.includes('rừng') || catLower.includes('hồ')) {
    return {
      id: 'mountain',
      label: 'Núi rừng & Thắng cảnh',
      primaryColor: '#D4F7D4', // Soft solid fresh matcha green
      textColor: '#1E824C', // Solid deep garden green
      renderIcon: (cls: string) => <Mountain className={cls} />,
    };
  }

  // 7. Heritage & Landmarks: Solid Honey Sun gold (Bright high-energy gold)
  if (catLower.includes('chùa') || catLower.includes('đền') || catLower.includes('di tích') || catLower.includes('bảo tàng') || catLower.includes('phố cổ') || catLower.includes('lăng')) {
    return {
      id: 'landmark',
      label: 'Di tích & Phố cổ',
      primaryColor: '#FEF3C7', // Soft solid honey cream
      textColor: '#D97706', // Solid sunset gold
      renderIcon: (cls: string) => <Landmark className={cls} />,
    };
  }

  // 8. Default Travel & Exploration: Solid Pastel Turquoise Mint
  return {
    id: 'du_lich',
    label: 'Du lịch & Trải nghiệm',
    primaryColor: '#E6FFFA', // Soft solid minty teal tint
    textColor: '#0D9488', // Solid vibrant jade teal
    renderIcon: (cls: string) => <Palmtree className={cls} />,
  };
}
