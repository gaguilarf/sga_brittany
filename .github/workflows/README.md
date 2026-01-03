# GitHub Actions - Deployment Workflow

## Configuración Inicial

### 1. Crear cuenta FTP en Banahost cPanel

1. Accede a tu cPanel de Banahost
2. Ve a **File Manager > FTP Accounts**
3. Crea una nueva cuenta FTP con acceso al directorio donde quieres desplegar

### 2. Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** > **Secrets and variables** > **Actions**
3. Click en **New repository secret** y agrega los siguientes secrets:

   - **FTP_HOST**: `tu-servidor.banahost.com` (el host FTP de Banahost)
   - **FTP_USER**: tu usuario FTP
   - **FTP_PASS**: tu contraseña FTP

### 3. Ajustar el directorio de destino (opcional)

Si necesitas desplegar en un subdirectorio específico, edita el archivo `deploy.yml` y cambia:

```yaml
server-dir: public_html/
```

Por ejemplo, para un subdominio:
```yaml
server-dir: public_html/subdominio/
```

## Uso

Una vez configurado, el deployment es automático:

1. Haz cambios en tu código
2. Commit y push a la rama `main`:
   ```bash
   git add .
   git commit -m "Tu mensaje"
   git push origin main
   ```
3. GitHub Actions automáticamente:
   - Instala las dependencias
   - Compila el proyecto (`npm run build`)
   - Sube la carpeta `out/` a Banahost vía FTP

## Monitorear Deployments

Puedes ver el estado de los deployments en:
- GitHub > Tu repositorio > **Actions**

Ahí verás cada ejecución del workflow con logs detallados.
