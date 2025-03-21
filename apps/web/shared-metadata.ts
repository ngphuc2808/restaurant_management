import { envConfig } from '@/config'

export const baseOpenGraph = {
  locale: 'en_US',
  alternateLocale: ['vi_VN'],
  type: 'website',
  siteName: 'Bigboy Restaurant',
  images: [
    {
      url: 'https://github.com/ngphuc2808/restaurant_management/blob/main/apps/web/public/main-logo.png?raw=true',
    },
  ],
}

export const idJsonObject = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Big Boy Restaurant',
  image: {
    '@type': 'ImageObject',
    url: 'https://github.com/ngphuc2808/restaurant_management/blob/main/apps/web/public/main-logo.png?raw=true',
    width: 1080,
    height: 1080,
  },
  telephone: '0866866923',
  url: `${envConfig.NEXT_PUBLIC_URL}/`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'District 7, Ho Chi Minh City',
    addressLocality: 'Ho Chi Minh',
    postalCode: '700000',
    addressRegion: 'Ho Chi Minh',
    addressCountry: 'VN',
  },
  priceRange: '1000 - 1000000000',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '06:00',
      closes: '24:00',
    },
  ],
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.73846351013074',
    longitude: '106.70412618091689',
  },
}
