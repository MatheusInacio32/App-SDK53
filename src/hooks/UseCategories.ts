import { useRoute } from '@react-navigation/native';

interface SearchParams {
  subcategory?: string;
}

export function useSearchParams(): SearchParams {
  const route = useRoute();
  return route.params as SearchParams;
}
