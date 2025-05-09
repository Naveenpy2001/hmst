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

router.register(r'monthly-payment', AdminMonthlyPaymentViewSet, basename='admin-monthly-payment')   #admin
router.register(r'upload', FileUploadViewSet, basename='file-upload')

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend-otp"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    path('admin/', AdminDoctorPatientStatsView.as_view(), name='doctor-patient-stats'), #admin

    path('monthly-stats/', DoctorMonthlyStatsView.as_view(), name='doctor-patient-stats'),  #admin

    # dct payment
    path('doctor-payment/', DoctorPaymentStatusView.as_view(), name='doctor-patient-stats'),

    path('tickets/', TicketAPIView.as_view(), name='tickets'),
    path('admin/tickets/', AdminTicketAPIView.as_view(), name='admin-tickets'), #admin
    path('admin/tickets/<int:ticket_id>/', AdminTicketAPIView.as_view(), name='admin-ticket-detail'), #admin

    # admin urls
    # Admin Management URLs
    path('admin/doctors/', AdminDoctorListView.as_view(), name='admin-doctor-list'),
    path('admin/payments/', AdminPaymentManagementView.as_view(), name='admin-payment-management'),
    path('admin/payment-reports/',MonthlyPaymentReportView.as_view(), name='admin-payment-reports'),
    path('admin/doctor-stats/', AdminDoctorPatientStatsView.as_view(), name='admin-doctor-stats'),

    # Doctor Payment URLs
    path('doctor/payment-status/', DoctorPaymentStatusAPIView.as_view(), name='doctor-payment-status'),
    path('doctor/monthly-stats/', DoctorMonthlyStatsView.as_view(), name='doctor-monthly-stats'),

    path('',include(router.urls))
]