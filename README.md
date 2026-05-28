# Restoran Stok Takip Sistemi - Bulut Bilişim Final Projesi

Bu proje, bulut bilişim prensiplerine uygun olarak tasarlanmış, container mimarisine sahip ve Google Kubernetes Engine (GKE) üzerinde çalışan bir web uygulamasıdır. Proje, modern CI/CD süreçlerini, yüksek erişilebilirliği (High Availability), otomatik ölçeklenebilirliği (HPA) ve kalıcı veri depolama (PVC) konseptlerini içermektedir.

## 1. Uygulama ve Sistem Mimarisi (v3 Güncellemesi)

**Sistem Mimarisi:**
Projemiz 3 ana bileşenden oluşmaktadır:
1.  **Frontend (React & Framer Motion):** Kullanıcı arayüzünü sağlayan web uygulaması. v3 sürümü ile birlikte "Stok Yönetimi" ve "Tarif Menüsü" olmak üzere iki farklı sekmeye ayrılmıştır. Gelişmiş bir Drag & Drop animasyonu (160 derece rotasyonlu `spring` fiziği) ve özel tasarımlı silme onay pencereleri barındırır. Nginx web sunucusu üzerinde servis edilmektedir.
2.  **Backend (FastAPI):** Stok ve Tarif verilerini yöneten Python tabanlı servis. v3 sürümüyle birlikte `Recipe` ve `RecipeIngredient` adında yeni veritabanı ilişkileri (ilişkisel veritabanı modellemesi) kurgulanmış, `/recipes/{id}/cook` gibi kompleks iş mantıkları eklenmiştir.
3.  **Veritabanı (Database):** Verilerin kalıcı olarak saklandığı PostgreSQL veritabanı.

Tüm bu bileşenler Docker ile bağımsız container'lar haline getirilmiş (Containerization) ve mikroservis mantığıyla birbirinden izole edilerek Google Cloud Artifact Registry üzerinde depolanmıştır.

## 2. Kubernetes Mimarisi

Google Kubernetes Engine (GKE) üzerinde 3 Node'lu bir küme (Cluster) kurgulanmıştır.
-   **Control Plane:** GKE tarafından yönetilmektedir.
-   **Worker Node'lar:** `europe-west4` bölgesinde (region) çalışan 3 adet sanal makine (e2-medium).
-   **Pod Dağılımı:** Frontend ve Backend Deployment'ları, Kubernetes zamanlayıcısı (Scheduler) tarafından uygun node'lara yerleştirilmektedir. HPA (Horizontal Pod Autoscaler) sayesinde trafik arttığında yeni Pod'lar diğer node'lara da yayılarak yük dengesi sağlanır.

## 3. CI/CD Pipeline Akışı

Sürekli Entegrasyon ve Sürekli Dağıtım (CI/CD) için **GitHub Actions** kullanılmıştır (`.github/workflows/deploy.yml`).

**Akış Adımları:**
1.  **Push:** Geliştirici `main` branch'ine kod gönderir.
2.  **Auth:** GitHub Actions, Google Cloud'a kimlik doğrulaması yapar (GCP_CREDENTIALS secret'ı kullanılarak).
3.  **Build:** Frontend ve Backend dizinlerindeki Dockerfile'lar kullanılarak yeni Docker imajları derlenir. İmajlar GitHub commit SHA'sı ile etiketlenir.
4.  **Push:** Derlenen imajlar, Google Cloud Artifact Registry'ye (`europe-west4-docker.pkg.dev/...`) pushlanır.
5.  **Deploy:** Pipeline, yeni imaj etiketlerini K8s manifestolarına (`api-deployment.yaml`, `frontend-deployment.yaml`) yerleştirir ve `kubectl apply` komutlarıyla değişiklikleri GKE cluster'ına yansıtır.

## 4. Kubernetes Kaynaklarının Kullanımı

Projede aşağıdaki Kubernetes objeleri aktif olarak kullanılmıştır:

*   **Deployment:** Frontend ve API bileşenlerinin versiyon kontrolünü, Replica Set yönetimini ve "Rolling Update" işlemlerini sağlamak için kullanılmıştır. Pod'ların her zaman istenilen sayıda (replica) ayakta kalmasını garanti eder.
*   **Service (LoadBalancer & ClusterIP):** 
    *   *Frontend ve API* için dış dünyadan erişim sağlamak amacıyla `LoadBalancer` tipinde servisler oluşturulmuş, GKE tarafından otomatik olarak dış IP atanmıştır.
    *   *Veritabanı* için sadece küme içi iletişime izin veren `ClusterIP` tipinde servis kullanılmıştır.
*   **Persistent Volume / PVC (Kalıcı Veri):** PostgreSQL veritabanındaki verilerin Pod'lar silinse bile kaybolmaması için Google Cloud diskleri ile entegre bir `PersistentVolumeClaim` (db-pvc.yaml) kullanılmıştır.
*   **Network Policy:** Güvenlik katmanı olarak `network-policy.yaml` yapılandırılmıştır. Bu kural, Veritabanı pod'una sadece API pod'undan gelen isteklerin ulaşmasına izin verir, diğer tüm trafik (örneğin frontend'den doğrudan DB'ye) engellenir.

---

## 5. Operasyonel İşlemler (Sunum Rehberi)

Sunum sırasında sistemin yeteneklerini göstermek için aşağıdaki senaryoları uygulayabilirsiniz:

### A. Ölçekleme (Scaling)
Trafik arttığında sistemin nasıl genişlediğini göstermek için:
*   **Otomatik Ölçekleme (HPA):** `api-hpa.yaml` dosyası CPU kullanımı %50'yi geçtiğinde Pod sayısını 1'den 5'e kadar otomatik çıkaracak şekilde yapılandırılmıştır. (Görmek için: `kubectl get hpa`)
*   **Manuel Ölçekleme:** Anlık müdahale gerekirse terminalden:
    ```bash
    kubectl scale deployment frontend --replicas=3
    ```
    *(Bu komut Frontend Pod sayısını anında 3'e çıkarır).*

### B. Kesintisiz Güncelleme (Rolling Update)
Uygulamanın yeni bir versiyonu çıktığında, eski pod'lar yavaşça kapanırken yerine yenileri açılır, böylece sistem hiç çökmez (Zero Downtime).
*   **Nasıl Test Edilir:**
    ```bash
    kubectl set image deployment/api api=europe-west4-docker.pkg.dev/restoran-stok-projesi/restoran-repo/restoran-api:v2
    ```
*   **Durumu İzlemek İçin:**
    ```bash
    kubectl rollout status deployment/api
    ```

### C. Geri Alma (Rollback)
Eğer canlıya alınan yeni versiyonda (örneğin v2) bir hata (Bug) tespit edilirse, saniyeler içinde önceki çalışan sürüme dönülebilir.
*   **Geri Dönüş Komutu:**
    ```bash
    kubectl rollout undo deployment/api
    ```
*   *(Bu işlem sistemi anında son stabil haline geri döndürür).*
