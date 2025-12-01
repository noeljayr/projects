export const useOpenParam = (key: string, value: string) => {
  const params = new URLSearchParams(window.location.search);

  if (!params.has(key)) {
    params.set(key, value);
    const newSearch = params.toString();
    const newUrl = `?${newSearch}`;
    history.pushState(null, "", newUrl);
  }
};

export const useCloseParam = (key: string) => {
  const params = new URLSearchParams(window.location.search);
  params.delete(key);
  const newSearch = params.toString();
  const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
  history.pushState(null, "", newUrl);
};
