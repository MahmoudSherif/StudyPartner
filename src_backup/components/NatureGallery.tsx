import React, { useState, useRef, useEffect } from 'react';
import { 
  Search
} from 'lucide-react';

const NatureGallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const images = [
    // Sea & Ocean - Using responsive image sizes
    { id: '1', url: 'https://picsum.photos/600/400?random=1', title: 'Tropical Beach' },
    { id: '2', url: 'https://picsum.photos/600/400?random=2', title: 'Ocean Waves' },
    { id: '3', url: 'https://picsum.photos/600/400?random=3', title: 'Underwater World' },
    { id: '25', url: 'https://picsum.photos/600/400?random=25', title: 'Crystal Clear Waters' },
    { id: '26', url: 'https://picsum.photos/600/400?random=26', title: 'Rocky Coastline' },
    { id: '27', url: 'https://picsum.photos/600/400?random=27', title: 'Deep Blue Ocean' },
    { id: '28', url: 'https://picsum.photos/600/400?random=28', title: 'Seaside Cliffs' },
    
    // Trees & Forest
    { id: '4', url: 'https://picsum.photos/600/400?random=4', title: 'Misty Forest' },
    { id: '5', url: 'https://picsum.photos/600/400?random=5', title: 'Autumn Colors' },
    { id: '6', url: 'https://picsum.photos/600/400?random=6', title: 'Ancient Tree' },
    { id: '29', url: 'https://picsum.photos/600/400?random=29', title: 'Bamboo Grove' },
    { id: '30', url: 'https://picsum.photos/600/400?random=30', title: 'Pine Forest' },
    { id: '31', url: 'https://picsum.photos/600/400?random=31', title: 'Redwood Giants' },
    { id: '32', url: 'https://picsum.photos/600/400?random=32', title: 'Maple Leaves' },
    
    // Animals (Wildlife only)
    { id: '7', url: 'https://picsum.photos/600/400?random=7', title: 'Lion Portrait' },
    { id: '8', url: 'https://picsum.photos/600/400?random=8', title: 'Wolf Pack' },
    { id: '9', url: 'https://picsum.photos/600/400?random=9', title: 'Wild Horses' },
    { id: '33', url: 'https://picsum.photos/600/400?random=33', title: 'Eagle in Flight' },
    { id: '34', url: 'https://picsum.photos/600/400?random=34', title: 'Deer in Meadow' },
    { id: '35', url: 'https://picsum.photos/600/400?random=35', title: 'Butterfly Garden' },
    { id: '36', url: 'https://picsum.photos/600/400?random=36', title: 'Dolphin Jump' },
    
    // Moon & Night
    { id: '10', url: 'https://picsum.photos/600/400?random=10', title: 'Full Moon' },
    { id: '11', url: 'https://picsum.photos/600/400?random=11', title: 'Moonlit Forest' },
    { id: '12', url: 'https://picsum.photos/600/400?random=12', title: 'Crescent Moon' },
    { id: '37', url: 'https://picsum.photos/600/400?random=37', title: 'Starry Night' },
    { id: '38', url: 'https://picsum.photos/600/400?random=38', title: 'Lunar Eclipse' },
    { id: '39', url: 'https://picsum.photos/600/400?random=39', title: 'Moon Over Mountains' },
    
    // Space & Stars
    { id: '13', url: 'https://picsum.photos/600/400?random=13', title: 'Galaxy' },
    { id: '14', url: 'https://picsum.photos/600/400?random=14', title: 'Star Field' },
    { id: '15', url: 'https://picsum.photos/600/400?random=15', title: 'Nebula' },
    { id: '40', url: 'https://picsum.photos/600/400?random=40', title: 'Aurora Borealis' },
    { id: '41', url: 'https://picsum.photos/600/400?random=41', title: 'Milky Way' },
    { id: '42', url: 'https://picsum.photos/600/400?random=42', title: 'Shooting Stars' },
    
    // Mountains
    { id: '16', url: 'https://picsum.photos/600/400?random=16', title: 'Snowy Peaks' },
    { id: '17', url: 'https://picsum.photos/600/400?random=17', title: 'Mountain Lake' },
    { id: '18', url: 'https://picsum.photos/600/400?random=18', title: 'Alpine Meadow' },
    { id: '43', url: 'https://picsum.photos/600/400?random=43', title: 'Rocky Summit' },
    { id: '44', url: 'https://picsum.photos/600/400?random=44', title: 'Mountain Stream' },
    { id: '45', url: 'https://picsum.photos/600/400?random=45', title: 'Valley View' },
    
    // Flowers
    { id: '19', url: 'https://picsum.photos/600/400?random=19', title: 'Cherry Blossoms' },
    { id: '20', url: 'https://picsum.photos/600/400?random=20', title: 'Sunflowers' },
    { id: '21', url: 'https://picsum.photos/600/400?random=21', title: 'Rose Garden' },
    { id: '46', url: 'https://picsum.photos/600/400?random=46', title: 'Tulip Fields' },
    { id: '47', url: 'https://picsum.photos/600/400?random=47', title: 'Lavender Fields' },
    { id: '48', url: 'https://picsum.photos/600/400?random=48', title: 'Wildflower Meadow' },
    
    // Sunset & Sunrise
    { id: '22', url: 'https://picsum.photos/600/400?random=22', title: 'Golden Hour' },
    { id: '23', url: 'https://picsum.photos/600/400?random=23', title: 'Dawn Breaking' },
    { id: '24', url: 'https://picsum.photos/600/400?random=24', title: 'Silhouette Sunset' },
    { id: '49', url: 'https://picsum.photos/600/400?random=49', title: 'Purple Haze' },
    { id: '50', url: 'https://picsum.photos/600/400?random=50', title: 'Orange Sky' },
    { id: '51', url: 'https://picsum.photos/600/400?random=51', title: 'Pink Clouds' }
  ];

  // Shuffle images on each render for random order
  const shuffledImages = React.useMemo(() => {
    return [...images].sort(() => Math.random() - 0.5);
  }, []);

  const filteredImages = shuffledImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollInterval: number;
    
    const scroll = () => {
      if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        scrollContainer.scrollTop = 0;
      } else {
        scrollContainer.scrollTop += 1;
      }
    };

    scrollInterval = setInterval(scroll, 100) as any;

    return () => {
      clearInterval(scrollInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">🌿 Nature Gallery</h1>
        <p className="text-slate-400">Find inspiration in the beauty of nature</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search nature images..."
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div className="text-sm text-slate-400 text-center sm:text-left">
            {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Auto-scrolling Nature Gallery */}
      <div className="card p-0">
        <div className="p-4 bg-slate-800/60 rounded-t-lg ring-1 ring-white/10">
          <span className="text-sm text-slate-400">🔄 Auto-scrolling nature gallery</span>
        </div>
        
        <div
          ref={scrollContainerRef}
          className="p-3 sm:p-4 overflow-y-auto h-96 sm:h-[500px]"
        >
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}
          >
            {filteredImages.map((image) => (
              <div key={image.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/25">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-24 sm:h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-2 sm:p-3 bg-black/20 backdrop-blur-sm">
                  <h3 className="font-semibold text-white text-center text-sm sm:text-base">{image.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="card text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-4">🌿</div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">
            No images found
          </h3>
          <p className="text-slate-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default NatureGallery;