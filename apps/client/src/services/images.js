// Campbell product images are served by Cloudinary; request a width that stays sharp on 2x screens.
export function sizedImage(url, width) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace(/\/upload\/[^/]*\//, `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
