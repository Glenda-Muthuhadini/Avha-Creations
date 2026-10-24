// Public launch defaults supplied by AVHA. Database settings take priority.
export const BUSINESS = {
  business_name: 'AVHA CREATIONS',
  whatsapp_number: '27762123234',
  physical_address: '5562 Amogelang Street, Olievenhoutbosch Ext 25, Centurion, 0157',
  instagram_url: 'https://www.instagram.com/avha_creation/',
  instagram_handle: '@avha_creation',
};

export function enquiryUrl(number, message = 'Hi AVHA, I’d like to enquire about a creation or hair appointment.') {
  const digits = String(number || '').replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
