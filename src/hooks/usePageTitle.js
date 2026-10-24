import { useEffect } from 'react';
export function usePageTitle(title, description = 'Discover handmade accessories and personal hair artistry in Centurion, South Africa.') {
  useEffect(() => {
    document.title = `${title} | AVHA CREATIONS`;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = description;
  }, [title, description]);
}
