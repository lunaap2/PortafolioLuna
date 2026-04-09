        class Router {
            constructor() {
                // ══════════════════════════════════════════
                // 1. DEFINICIÓN DE RUTAS
                // ══════════════════════════════════════════

                // Rutas estáticas: mapean un path a un ID de sección en el DOM
                this.staticRoutes = {
                    '/':                '/inicio',
                    '/inicio':          'inicio',
                    '/sobre-mi':        'sobre-mi',
                    '/proyectos':       'proyectos',
                    '/habilidades':     'habilidades',
                    '/certificaciones': 'certificaciones',
                    '/testimonios':     'testimonios',
                    '/contacto':        'contacto',
                };

                // Rutas dinámicas: patrones con parámetros (:param)
                // Cada entrada define: pattern (regex), keys (nombres de params), viewId
                this.dynamicRoutes = [
                    {
                        pattern: /^\/user\/([^\/]+)$/,
                        keys: ['id'],
                        viewId: 'user-profile'
                    }
                    // Puedes agregar más rutas dinámicas aquí, por ejemplo:
                    // { pattern: /^\/proyecto\/([^\/]+)$/, keys: ['slug'], viewId: 'proyecto-detalle' }
                ];

                // Almacena los parámetros de la ruta actual
                this.params = {};

                // Base path para GitHub Pages
                this.basePath = document.querySelector('base')?.getAttribute('href')?.replace(/\/$/, '') || '';

                // ══════════════════════════════════════════
                // 2. ACTIVAR MODO SPA
                // ══════════════════════════════════════════
                document.body.classList.add('spa-active');

                // ══════════════════════════════════════════
                // 3. INTERCEPTAR CLICS EN LINKS [data-spa-link]
                // ══════════════════════════════════════════
                document.addEventListener('click', (e) => {
                    // Buscar el <a> más cercano con data-spa-link
                    const anchor = e.target.closest('[data-spa-link]');
                    if (!anchor) return;

                    e.preventDefault();
                    const href = anchor.getAttribute('href');

                    // Si ya estamos en la misma ruta, no hacer nada
                    if (href === this.getCurrentPath()) return;

                    // Empujar nueva entrada al historial del navegador (History API)
                    window.history.pushState({}, '', this.basePath + href);
                    this.handleRouting();
                });

                // ══════════════════════════════════════════
                // 4. ESCUCHAR BOTONES ATRÁS / ADELANTE
                // ══════════════════════════════════════════
                window.addEventListener('popstate', () => this.handleRouting());

                // ══════════════════════════════════════════
                // 5. MANEJAR RUTA INICIAL
                // ══════════════════════════════════════════
                this.handleRouting();
            }

            // ══════════════════════════════════════════
            // OBTENER PATH ACTUAL (sin base path)
            // ══════════════════════════════════════════
            getCurrentPath() {
                let path = window.location.pathname;
                // Remover base path si existe
                if (this.basePath && path.startsWith(this.basePath)) {
                    path = path.slice(this.basePath.length);
                }
                return path || '/';
            }

            // ══════════════════════════════════════════
            // RESOLVER RUTA → determinar qué vista mostrar
            // ══════════════════════════════════════════
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

            // ══════════════════════════════════════════
            // HANDLE ROUTING — método principal
            // ══════════════════════════════════════════
            handleRouting() {
                const path = this.getCurrentPath();
                const { viewId, params } = this.resolveRoute(path);

                // Renderizado condicional
                this.renderView(viewId, params);

                // Actualizar menú activo
                this.updateActiveNav(path);
            }

            // ══════════════════════════════════════════
            // RENDERIZADO CONDICIONAL
            // ══════════════════════════════════════════
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

                // ─── Renderizar contenido dinámico ───
                // Ejemplo: acceder al parámetro :id dentro de la vista user-profile
                if (viewId === 'user-profile' && params.id) {
                    const display = document.getElementById('user-id-display');
                    if (display) display.textContent = params.id;
                }

                // Scroll arriba
                window.scrollTo(0, 0);
            }

            // ══════════════════════════════════════════
            // ACTUALIZAR NAVEGACIÓN ACTIVA
            // ══════════════════════════════════════════
            updateActiveNav(currentPath) {
                document.querySelectorAll('.nav-link-custom').forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');
                    if (href === currentPath || (currentPath === '/' && href === '/inicio')) {
                        link.classList.add('active');
                    }
                });
            }

            // ══════════════════════════════════════════
            // MÉTODO PÚBLICO: Navegar programáticamente
            // ══════════════════════════════════════════
            navigateTo(path) {
                window.history.pushState({}, '', this.basePath + path);
                this.handleRouting();
            }

            // ══════════════════════════════════════════
            // MÉTODO PÚBLICO: Obtener parámetros actuales
            // ══════════════════════════════════════════
            getParams() {
                return { ...this.params };
            }
        }

        // ══════════════════════════════════════════
        // INICIALIZACIÓN
        // ══════════════════════════════════════════
        document.addEventListener('DOMContentLoaded', () => {
            // Instancia global accesible desde consola o desde otros scripts
            window.spaRouter = new Router();

            // ─── Ejemplo de uso programático ───
            // window.spaRouter.navigateTo('/user/luna-diaz');
            // console.log(window.spaRouter.getParams()); // { id: 'luna-diaz' }
        });
