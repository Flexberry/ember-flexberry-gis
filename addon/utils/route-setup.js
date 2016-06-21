export default function(router) {
   router.route('maps');
   router.route('map', { path: 'maps/:id' });
}
