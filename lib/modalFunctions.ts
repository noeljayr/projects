export const openModal = (name: string, state: string) => {
  const params = new URLSearchParams(window.location.search);

  if (!params.has(name)) {
    params.set(name, state);
    const newSearch = params.toString();
    const newUrl = `?${newSearch}`;
    history.pushState(null, "", newUrl);
  }
};

export const closeModal = (name: string) => {
  const params = new URLSearchParams(window.location.search);
  params.delete(name);
  const newSearch = params.toString();
  const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
  history.pushState(null, "", newUrl);
};