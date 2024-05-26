import useSWR from "swr";
import apiClient from "../apiClient";

const useCurrentMember = () => {
  const apiUrl = "http://localhost:8080/api/member";
  const { data, isLoading, error, mutate } = useSWR(
    [apiUrl], // URL을 배열로 전달
    async (url) => {
      const response = await apiClient.get(url);

      const data = response.data;
      return data;
    }
  );

  return {
    currentMember: data,
    isLoading,
    error,
    currentUserMutate: mutate,
  };
};

export { useCurrentMember };
