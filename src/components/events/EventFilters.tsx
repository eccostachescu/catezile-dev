import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/Badge";
import { X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Filters {
  city: string;
  category: string;
  month: string;
  timeframe: string;
}

interface FilterOptions {
  cities: Array<{ slug: string; name: string; count: number }>;
  categories: Array<{ slug: string; name: string; count: number }>;
}

interface EventFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const [options, setOptions] = useState<FilterOptions>({ cities: [], categories: [] });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Get cities with published events
      const { data: cityEvents } = await supabase
        .from('event')
        .select('city_id')
        .eq('status', 'PUBLISHED')
        .not('city_id', 'is', null);

      const { data: cities } = await supabase
        .from('city')
        .select('id, slug, name')
        .order('name');

      // Get categories with published events
      const { data: categoryEvents } = await supabase
        .from('event')
        .select('category_id')
        .eq('status', 'PUBLISHED')
        .not('category_id', 'is', null);

      const { data: categories } = await supabase
        .from('event_category')
        .select('id, slug, name')
        .order('name');

      // Count events per city
      const cityCounts = new Map();
      cityEvents?.forEach(event => {
        const count = cityCounts.get(event.city_id) || 0;
        cityCounts.set(event.city_id, count + 1);
      });

      // Count events per category
      const categoryCounts = new Map();
      categoryEvents?.forEach(event => {
        const count = categoryCounts.get(event.category_id) || 0;
        categoryCounts.set(event.category_id, count + 1);
      });

      setOptions({
        cities: cities?.map(city => ({
          slug: city.slug,
          name: city.name,
          count: cityCounts.get(city.id) || 0
        })).filter(city => city.count > 0) || [],
        categories: categories?.map(cat => ({
          slug: cat.slug,
          name: cat.name,
          count: categoryCounts.get(cat.id) || 0
        })).filter(cat => cat.count > 0) || []
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const updateFilters = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ city: '', category: '', month: '', timeframe: 'all' });
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all');
  const monthOptions = [
    { value: '', label: 'Toate lunile' },
    { value: '1', label: 'Ianuarie' },
    { value: '2', label: 'Februarie' },
    { value: '3', label: 'Martie' },
    { value: '4', label: 'Aprilie' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Iunie' },
    { value: '7', label: 'Iulie' },
    { value: '8', label: 'August' },
    { value: '9', label: 'Septembrie' },
    { value: '10', label: 'Octombrie' },
    { value: '11', label: 'Noiembrie' },
    { value: '12', label: 'Decembrie' }
  ];

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrează
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {Object.values(filters).filter(v => v && v !== 'all').length}
              </Badge>
            )}
          </Button>

          {/* Quick filters */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant={filters.timeframe === 'today' ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters('timeframe', filters.timeframe === 'today' ? 'all' : 'today')}
            >
              Astăzi
            </Button>
            <Button
              variant={filters.timeframe === 'weekend' ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters('timeframe', filters.timeframe === 'weekend' ? 'all' : 'weekend')}
            >
              Weekend
            </Button>
            <Button
              variant={filters.timeframe === 'month' ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters('timeframe', filters.timeframe === 'month' ? 'all' : 'month')}
            >
              Luna aceasta
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Șterge filtrele
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg bg-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Oraș</label>
              <Select value={filters.city} onValueChange={(value) => updateFilters('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toate orașele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toate orașele</SelectItem>
                  {options.cities.map((city) => (
                    <SelectItem key={city.slug} value={city.slug}>
                      {city.name} ({city.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categorie</label>
              <Select value={filters.category} onValueChange={(value) => updateFilters('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toate categoriile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toate categoriile</SelectItem>
                  {options.categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Luna</label>
              <Select value={filters.month} onValueChange={(value) => updateFilters('month', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toate lunile" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Perioada</label>
              <Select value={filters.timeframe} onValueChange={(value) => updateFilters('timeframe', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="today">Astăzi</SelectItem>
                  <SelectItem value="weekend">În weekend</SelectItem>
                  <SelectItem value="month">Luna aceasta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.city && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Oraș: {options.cities.find(c => c.slug === filters.city)?.name || filters.city}
              <button
                onClick={() => updateFilters('city', '')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {options.categories.find(c => c.slug === filters.category)?.name || filters.category}
              <button
                onClick={() => updateFilters('category', '')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.month && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {monthOptions.find(m => m.value === filters.month)?.label || filters.month}
              <button
                onClick={() => updateFilters('month', '')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.timeframe && filters.timeframe !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.timeframe === 'today' && 'Astăzi'}
              {filters.timeframe === 'weekend' && 'Weekend'}
              {filters.timeframe === 'month' && 'Luna aceasta'}
              <button
                onClick={() => updateFilters('timeframe', 'all')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}