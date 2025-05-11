# urls.py
from django.urls import path,include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'user-details', UserViewSet, basename='user-details')
router.register(r'patients', PatientViewSet, basename='patients')
router.register(r'records', MedicalRecordViewSet, basename='medical-records')
router.register(r'lab-tests', LabTestViewSet, basename='lab-test')
router.register(r'pharmacy', PharmacyViewSet, basename='pharmacy')

router.register(r'patients-main', PatientViewSetMain, basename='patient-main')

router.register(r'upload', FileUploadViewSet, basename='file-upload')

# admin urls
router.register(r'admin/monthly-payments', AdminMonthlyPaymentViewSet, basename='monthly-payments')

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend-otp"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    # path('admin/', AdminDoctorPatientStatsView.as_view(), name='doctor-patient-stats'), #admin


    path('tickets/', TicketAPIView.as_view(), name='tickets'),
    path('admin/tickets/', AdminTicketAPIView.as_view(), name='admin-tickets'), #admin
    path('admin/tickets/<int:ticket_id>/', AdminTicketAPIView.as_view(), name='admin-ticket-detail'), #admin

    # admin urls
    # Admin Management URLs
    path('admin/doctor-stats/', AdminDoctorPatientStatsView.as_view(), name='admin-doctor-stats'),
    path('admin/monthly-stats/', DoctorMonthlyStatsView.as_view(), name='monthly-stats'),
    path('admin/doctors/<int:pk>/status/', ToggleDoctorStatusView.as_view(), name='toggle-doctor-status'),
    path('admin/reset-monthly-counts/', MonthlyDoctorPaymentReset.as_view(), name='reset-monthly-counts'),
    path('doctor/payment-status/', DoctorPaymentStatusView.as_view(), name='doctor-payment-status'),
    

    path('',include(router.urls))
]