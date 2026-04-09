// ══════════════════════════════════════════
// SPA Router — History API
// ══════════════════════════════════════════
class Router {
    constructor() {
        // ── 1. DEFINICIÓN DE RUTAS ──

        // Rutas estáticas: mapean un path a un ID de sección en el DOM
        this.staticRoutes = {
            '/':                'inicio',
            '/inicio':          'inicio',
            '/sobre-mi':        'sobre-mi',
            '/proyectos':       'proyectos',
            '/habilidades':     'habilidades',
            '/certificaciones': 'certificaciones',
            '/testimonios':     'testimonios',
            '/contacto':        'contacto',
        };

        // Rutas dinámicas: patrones con parámetros (:param)
        this.dynamicRoutes = [
            {
                pattern: /^\/user\/([^\/]+)$/,
                keys: ['id'],
                viewId: 'user-profile'
            }
        ];

        // Almacena los parámetros de la ruta actual
        this.params = {};

        // Base path: leer desde <meta name="spa-base"> inyectado por Astro
        this.basePath = document.querySelector('meta[name="spa-base"]')?.getAttribute('content')?.replace(/\/$/, '') || '';

        // ── 2. ACTIVAR MODO SPA ──
        document.body.classList.add('spa-active');

        // ── 3. INTERCEPTAR CLICS EN LINKS [data-spa-link] ──
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('[data-spa-link]');
            if (!anchor) return;

            e.preventDefault();
            const href = anchor.getAttribute('href');

            if (href === this.getCurrentPath()) return;

            window.history.pushState({}, '', this.basePath + href);
            this.handleRouting();
        });

        // ── 4. ESCUCHAR BOTONES ATRÁS / ADELANTE ──
        window.addEventListener('popstate', () => this.handleRouting());

        // ── 5. MANEJAR RUTA INICIAL ──
        this.handleRouting();
    }

    // Obtener path actual (sin base path)
    getCurrentPath() {
        let path = window.location.pathname;
        if (this.basePath && path.startsWith(this.basePath)) {
            path = path.slice(this.basePath.length);
        }
        // Normalizar: asegurar que siempre empieza con /
        if (!path || path === '') path = '/';
        // Remover trailing slash excepto para /
        if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);
        return path;
    }

    // Resolver ruta → determinar qué vista mostrar
    resolveRoute(path) {
        // 1) Intentar match con rutas estáticas
        if (this.staticRoutes[path]) {
            this.params = {};
            return { viewId: this.staticRoutes[path], params: {} };
        }

        // 2) Intentar match con rutas dinámicas
        for (const route of this.dynamicRoutes) {
            const match = path.match(route.pattern);
            if (match) {
                const params = {};
                route.keys.forEach((key, i) => {
                    params[key] = decodeURIComponent(match[i + 1]);
                });
                this.params = params;
                return { viewId: route.viewId, params };
            }
        }

        // 3) Ruta no encontrada → 404
        this.params = {};
        return { viewId: 'not-found', params: {} };
    }

    // Método principal de enrutamiento
    handleRouting() {
        const path = this.getCurrentPath();
        const { viewId, params } = this.resolveRoute(path);
        this.renderView(viewId, params);
        this.updateActiveNav(path);
    }

    // Renderizado condicional
    renderView(viewId, params = {}) {
        // Ocultar todas las vistas
        document.querySelectorAll('section, header.spa-header').forEach(el => {
            el.classList.remove('active-view');
        });

        // Mostrar la vista correspondiente
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active-view');

        // Header de bienvenida solo visible en "inicio"
        if (viewId === 'inicio') {
            const header = document.getElementById('header-alert');
            if (header) header.classList.add('active-view');
        }

        // Renderizar contenido dinámico (ruta /user/:id)
        if (viewId === 'user-profile' && params.id) {
            const display = document.getElementById('user-id-display');
            if (display) display.textContent = params.id;
        }

        window.scrollTo(0, 0);
    }

    // Actualizar navegación activa
    updateActiveNav(currentPath) {
        document.querySelectorAll('.nav-link-custom').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/inicio')) {
                link.classList.add('active');
            }
        });
    }

    // Navegar programáticamente
    navigateTo(path) {
        window.history.pushState({}, '', this.basePath + path);
        this.handleRouting();
    }

    // Obtener parámetros actuales
    getParams() {
        return { ...this.params };
    }
}

// ── INICIALIZACIÓN ──
window.spaRouter = new Router();
