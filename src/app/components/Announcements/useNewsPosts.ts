import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';

/** Every announcement, newest first as the API returns them. */
export const useNewsPosts = () => {
  const backpack = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.news,
    queryFn: () => backpack.GetNewsPosts().then(r => r.data),
  });
};
