export default [
    {
        path: '/',
        component: () => import('../pages/Tester'),
    }, {
        path: '/home',
        component: () => import('../pages/Home')
    }, {
        path: '/tools',
        component: () => import('../pages/Tools'),
    }, {
        path: '/404',
        component: () => import('../pages/NotFound')
    }
]