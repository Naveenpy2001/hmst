import random
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.template.loader import get_template
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated,IsAdminUser,BasePermission,AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets,filters
from rest_framework.decorators import action
from xhtml2pdf import pisa
from io import BytesIO
from .models import *
from .serializers import *



User = get_user_model()

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp = random.randint(100000, 999999)
            OTP.objects.create(user=user, otp=otp)
            subject = "Your OTP for Verification"
            message = f"Hello {user.email},\n\nYour OTP for verification is: {otp}\n\nThank you!"
            email_from = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.email]
            send_mail(subject, message, email_from, recipient_list)
            # Send OTP via email (implement your email logic here)
            print(f"OTP for {user.email}: {otp}")
            return Response(
                {"message": "User registered successfully. Please verify OTP."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    def post(self, request):
        serializer = OTPSerializer(data=request.data)
        if serializer.is_valid():
            otp = serializer.validated_data["otp"]
            try:
                otp_obj = OTP.objects.get(otp=otp)
                user = otp_obj.user
                user.is_verified = True
                user.save()
                otp_obj.delete()
                return Response(
                    {"message": "OTP verified successfully."},
                    status=status.HTTP_200_OK,
                )
            except OTP.DoesNotExist:
                return Response(
                    {"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            otp = random.randint(100000, 999999)
            OTP.objects.create(user=user, otp=otp)
            subject = "Your New OTP for Verification"
            message = f"Hello {user.email},\n\nYour new OTP for verification is: {otp}\n\nThank you!"
            email_from = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.email]
            send_mail(subject, message, email_from, recipient_list)
            print(f"OTP for {user.email}: {otp}")
            return Response(
                {"message": "OTP has been resent."}, status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )


class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        print("Trying login for:", email)

        try:
            user = User.objects.get(email=email)
            print("User found:", user.email)

            if user.check_password(password):
                print("Password correct")
                user.last_login = now()
                user.save(update_fields=['last_login'])
                if user.is_verified:
                    print("User is verified")
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    refresh_token = str(refresh)
                    return Response(
                        {
                            "message": "Login Successful",
                            "is_staff": user.is_staff,
                            "is_verified": user.is_verified,
                            'email': user.email,
                            'username': user.username,
                            "access": access_token,
                            "refresh": refresh_token
                        },
                        status=status.HTTP_200_OK,
                    )

                print("User is not verified")
                return Response(
                    {
                        "error": "User is not verified.",
                        'email': user.email,
                        'is_verified': user.is_verified,
                        'is_staff': user.is_staff
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            print("Password incorrect")
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            print("User not found")
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")

            if not refresh_token:
                return Response({"error": "Refresh token missing"}, status=status.HTTP_400_BAD_REQUEST)

            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            # Send success message, no need to remove cookies for localStorage
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            try:
                user = User.objects.get(email=email)
                otp = random.randint(100000, 999999)
                OTP.objects.create(user=user, otp=otp)

                # Send OTP via email
                subject = "Password Reset OTP"
                message = f"Hello {user.email},\n\nYour OTP for password reset is: {otp}. It is valid for 5 minutes.\n\nThank you!"
                email_from = settings.DEFAULT_FROM_EMAIL
                recipient_list = [user.email]
                send_mail(subject, message, email_from, recipient_list)

                return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    def get_object(self):
        return self.request.user

    def perform_create(self, serializer):
        serializer.save()

from datetime import datetime, timedelta, timezone as dt_timezone
from dateutil.relativedelta import relativedelta
from django.utils import timezone


class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["phone", "email"]

    def get_queryset(self):
        return PatientRegister.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True,methods=['post'],url_path='make-completed')
    def make_As_completed(self,request,pk=None):
        patient = self.get_object()
        patient.status = 'Completed'
        patient.save()
        return Response({"message":"maked as COmpleted"},status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='pending')
    def pending_patients(self, request):
        pending = self.get_queryset().filter(status='Pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='completed')
    def completed_patients(self, request):
    #     completed = self.get_queryset().filter(
    #     Q(status='Completed') | Q(status='In Progress')
    # )
        completed = self.get_queryset().filter(status='Completed')
        serializer = self.get_serializer(completed, many=True)
        return Response(serializer.data)
    
   

    @action(detail=False, methods=['get'], url_path='patients_stats')
    def get_stats(self, request):
        now = timezone.now()

        # Start of today
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Start of this month
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Start and end of last month
        last_month_end = month_start - timedelta(seconds=1)
        last_month_start = (month_start - relativedelta(months=1)).replace(day=1)

        # Start of this year
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Querysets
        completed_today_qs = self.get_queryset().filter(created_at__gte=today_start)
        completed_this_month_qs = self.get_queryset().filter(created_at__gte=month_start)
        completed_last_month_qs = self.get_queryset().filter(
            created_at__gte=last_month_start,
            created_at__lte=last_month_end
        )
        completed_this_year_qs = self.get_queryset().filter(created_at__gte=year_start)

        # Serializers
        serializer_today = self.get_serializer(completed_today_qs, many=True)
        serializer_this_month = self.get_serializer(completed_this_month_qs, many=True)
        serializer_last_month = self.get_serializer(completed_last_month_qs, many=True)
        serializer_year = self.get_serializer(completed_this_year_qs, many=True)

        # Generate monthly stats for the year
        monthly_stats = []
        for month in range(1, 13):
            start_date = datetime(now.year, month, 1, tzinfo=dt_timezone.utc)
            end_date = (start_date + relativedelta(months=1)) - timedelta(seconds=1)
            monthly_qs = self.get_queryset().filter(created_at__gte=start_date, created_at__lte=end_date)
            monthly_stats.append({
                'month': start_date.strftime('%B'),
                'count': monthly_qs.count(),
                # You can include serialized data if needed:
                # 'patients_data': self.get_serializer(monthly_qs, many=True).data
            })

        return Response({
            'completed_today_count': completed_today_qs.count(),
            'completed_this_month_count': completed_this_month_qs.count(),
            'completed_last_month_count': completed_last_month_qs.count(),
            'completed_this_year_count': completed_this_year_qs.count(),
            'today_patients_data': serializer_today.data,
            'this_month_patients_data': serializer_this_month.data,
            'last_month_patients_data': serializer_last_month.data,
            'this_year_patients_data': serializer_year.data,
            'monthly_stats': monthly_stats
        })


    
    @action(detail=False,methods=['get'],url_path='today_completed')
    def recet_completed(self,request):
        last_24_hours = timezone.now() - timedelta(hours=24)
        recent_completed = self.queryset.filter(
            status = 'Completed',
            updated_at__gte = last_24_hours
        )
        serialize =  self.get_serializer(recent_completed,many=True)
        return Response(serialize.data)


    

class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['doctorAdvice', 'tablets', 'injectionDetails']
    filterset_fields = ['status']

    def get_queryset(self):
        return MedicalRecord.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        medical_record = serializer.save()

        patient = medical_record.patient
        patient.status = 'Completed'
        patient.save()


from rest_framework.parsers import MultiPartParser, FormParser

class LabTestViewSet(viewsets.ModelViewSet):
    serializer_class = LabTestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return LabReport.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)



class TicketAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tickets = TicketModel.objects.filter(created_by=request.user)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = CreateTicketSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminTicketAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        tickets = TicketModel.objects.all()
        serializer = AdminTicketSerializer(tickets, many=True)
        return Response(serializer.data)
    
    def patch(self, request, ticket_id):
        try:
            ticket = TicketModel.objects.get(id=ticket_id)
        except TicketModel.DoesNotExist:
            return Response(
                {"error": "Ticket not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )        
        serializer = AdminTicketSerializer(ticket, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminDoctorPatientStatsView(APIView):
    permission_classes = [IsAdminUser] 

    def get(self, request):
        data = (
            User.objects
            .filter(patientregister__isnull=False)
            .annotate(
                total_patients=Count('patientregister'),
                amount_paid_to_admin=Sum('patientregister__charge_to_admin')
            )
            .values('email', 'total_patients', 'amount_paid_to_admin','username','last_daily_login','created_at')
        )

        # Format response
        result = [
            {
                "doctor_email": entry['email'],
                "total_patients": entry['total_patients'],
                "amount_paid_to_admin": float(entry['amount_paid_to_admin'] or 0),
                'username' : entry['username'],
                'last_daily_login' : entry['last_daily_login'],
                'created_at' : entry['created_at'],
            }
            for entry in data
        ]

        return Response(result)


class IsDoctorPaidThisMonth(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True  # Admins can always access
        today = timezone.now()
        paid = MonthlyDoctorPayment.objects.filter(
            doctor=request.user,
            year=today.year,
            month=today.month,
            paid=True
        ).exists()
        return paid



class DoctorMonthlyStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        records = MonthlyDoctorPayment.objects.all().order_by('-year', '-month')
        data = []
        for r in records:
            data.append({
                "doctor_email": r.doctor.email,
                "month": r.month,
                "year": r.year,
                "patients_registered": r.paid_patient_count,
                "amount_due": r.paid_patient_count * 20,
                "paid": r.paid
            })
        return Response(data)





class AdminMonthlyPaymentViewSet(viewsets.ModelViewSet):
    queryset = MonthlyDoctorPayment.objects.all()
    serializer_class = MonthlyPaymentUpdateSerializer
    permission_classes = [IsAdminUser]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        payment_amount = request.data.get('amount_paid', 0)
        
        try:
            payment_amount = float(payment_amount)
        except (TypeError, ValueError):
            return Response({"error": "Invalid payment amount"}, status=400)
        
        # Calculate how many patients this payment covers
        charge_per_patient = 20.00  # Your standard charge
        patients_covered = int(payment_amount / charge_per_patient)
        remaining_amount = payment_amount % charge_per_patient
        
        # Update the record
        instance.patients_paid += patients_covered
        instance.patients_pending = instance.total_patients - instance.patients_paid
        instance.amount_paid += (patients_covered * charge_per_patient)
        instance.amount_pending = (instance.patients_pending * charge_per_patient)
        
        # Mark as fully paid if no pending patients
        if instance.patients_pending == 0:
            instance.paid = True
        
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)






# The action in your view to generate the PDF
class PatientViewSetMain(viewsets.ModelViewSet):
    serializer_class = PatientDetailSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['first_name', 'last_name', 'phone', 'disease']

    def get_queryset(self):
        return PatientRegister.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='completed')
    def completed_patients(self, request):
        completed = self.get_queryset().filter(status='Completed')
        serializer = self.get_serializer(completed, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        patient = get_object_or_404(PatientRegister, pk=pk, user=request.user)
        medical_records = MedicalRecord.objects.filter(patient=patient)

        # Render the template with patient details
        template = get_template('pdf_template.html')
        context = {
            'patient': patient,
            'medical_records': medical_records
        }
        html_content = template.render(context)

        # Generate PDF using xhtml2pdf
        pdf_output = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_output)

        # Check if the PDF generation was successful
        if pisa_status.err:
            return HttpResponse("Error generating PDF", status=400)

        # Return the PDF as a response
        pdf_output.seek(0)
        response = HttpResponse(pdf_output, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="patient_{patient.id}_report.pdf"'
        return response


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class DoctorPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now()
        payments = MonthlyDoctorPayment.objects.filter(
            doctor=request.user
        ).order_by('-year', '-month')
        
        data = []
        for payment in payments:
            data.append({
                "month": payment.month,
                "year": payment.year,
                "total_patients": payment.total_patients,
                "patients_paid": payment.patients_paid,
                "patients_pending": payment.patients_pending,
                "amount_paid": float(payment.amount_paid),
                "amount_pending": float(payment.amount_pending),
                "paid": payment.paid,
                "updated_at": payment.updated_at
            })
        
        return Response(data)


class LabTestTypeViewSet(viewsets.ModelViewSet):
    queryset = LabReport.objects.all()
    serializer_class = LabTestTypeSerializer
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


import csv
import os
import pandas as pd
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser


ALLOWED_EXTENSIONS = ['csv', 'pdf', 'xlsx']

class FileUploadViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        category = request.data.get('category')  # 'tablet', 'injection', 'ointment', 'syrup', 'labtest'

        if not file or not category:
            return Response({"error": "File and category are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate File Type
        ext = os.path.splitext(file.name)[1][1:].lower()  # Get extension without dot
        if ext not in ALLOWED_EXTENSIONS:
            return Response({"error": f"Invalid file type '{ext}'. Only csv, pdf, xlsx allowed."}, status=status.HTTP_400_BAD_REQUEST)

        # Handle only CSV and Excel parsing
        items_created = []

        if ext == 'csv':
            decoded_file = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)

            items_created = self._save_records(reader, category)

        elif ext == 'xlsx':
            # Read Excel file
            df = pd.read_excel(file)
            records = df.to_dict(orient='records')

            items_created = self._save_records(records, category)

        elif ext == 'pdf':
            # For PDF, we are not extracting content, just saving file info
            return Response({"message": "PDF upload received. (Processing PDF content not implemented.)"}, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Unsupported file type."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(items_created, status=status.HTTP_201_CREATED)

    def _save_records(self, records, category):
        """Helper to save records to appropriate model"""
        items_created = []

        if category == 'tablet':
            for row in records:
                tablet = Tablet.objects.create(
                    name=row.get('Name'),
                    size=row.get('Size'),
                    dosage=row.get('Dosage')
                )
                items_created.append(TabletSerializer(tablet).data)

        elif category == 'injection':
            for row in records:
                injection = Injection.objects.create(
                    name=row.get('Name'),
                    size=row.get('Size'),
                    dosage=row.get('Dosage')
                )
                items_created.append(InjectionSerializer(injection).data)

        elif category == 'ointment':
            for row in records:
                ointment = Ointment.objects.create(
                    name=row.get('Name'),
                    size=row.get('Size'),
                    dosage=row.get('Dosage')
                )
                items_created.append(OintmentSerializer(ointment).data)

        elif category == 'syrup':
            for row in records:
                syrup = Syrup.objects.create(
                    name=row.get('Name'),
                    size=row.get('Size'),
                    dosage=row.get('Dosage')
                )
                items_created.append(SyrupSerializer(syrup).data)

        elif category == 'labtest':
            for row in records:
                labtest = LabTest.objects.create(
                    name=row.get('Name'),
                    description=row.get('Description', '')
                )
                items_created.append(LabTestSerializer(labtest).data)

        return items_created






# Add to views.py
from django.db.models import Q
from datetime import datetime

class AdminDoctorListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # Optimized single query with annotations
        doctors = User.objects.filter(
            Q(patientregister__isnull=False) & 
            Q(is_staff=False)
        ).annotate(
            total_patients=Count('patientregister'),
            current_month_patients=Count(
                'patientregister',
                filter=Q(
                    patientregister__created_at__month=current_month,
                    patientregister__created_at__year=current_year
                )
            ),
            amount_due=Sum('patientregister__charge_to_admin')
        ).values(
            'id', 'username', 'email', 'phone_number',
            'total_patients', 'current_month_patients', 'amount_due'
        ).distinct()
        
        return Response(list(doctors))

class AdminPaymentManagementView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get all unpaid payments with doctor details in a single query
        payments = DoctorPayment.objects.filter(
            is_paid=False
        ).select_related('doctor').order_by('year', 'month')
        
        serializer = DoctorPaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        month = request.data.get('month')
        year = request.data.get('year')
        
        try:
            payment = DoctorPayment.objects.get(
                doctor_id=doctor_id,
                month=month,
                year=year
            )
            payment.is_paid = True
            payment.payment_date = timezone.now().date()
            payment.save()
            
            # Update MonthlyDoctorPayment record if exists
            MonthlyDoctorPayment.objects.filter(
                doctor_id=doctor_id,
                month=month,
                year=year
            ).update(paid=True)
            
            return Response({'status': 'Payment marked as paid'})
        except DoctorPayment.DoesNotExist:
            return Response(
                {'error': 'Payment record not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class MonthlyPaymentReportView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Efficient grouped query
        reports = (
            DoctorPayment.objects
            .values('year', 'month')
            .annotate(
                total_doctors=Count('doctor', distinct=True),
                total_patients=Sum('patients_count'),
                total_amount=Sum('amount'),
                paid_amount=Sum('amount', filter=Q(is_paid=True)),
                unpaid_amount=Sum('amount', filter=Q(is_paid=False))
            )
            .order_by('-year', '-month')
        )
        
        return Response(list(reports))
    


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime
from django.db.models import Sum, Count, Q

class DoctorPaymentStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        current_date = timezone.now()
        current_month = current_date.month
        current_year = current_date.year
        
        # Get the doctor's payment status for the current month
        try:
            payment_status = DoctorPayment.objects.get(
                doctor=request.user,
                month=current_month,
                year=current_year
            )
            is_paid = payment_status.is_paid
            amount_due = payment_status.amount
            patients_count = payment_status.patients_count
        except DoctorPayment.DoesNotExist:
            # Calculate if no payment record exists yet
            patients_data = PatientRegister.objects.filter(
                user=request.user,
                created_at__month=current_month,
                created_at__year=current_year
            ).aggregate(
                patients_count=Count('id'),
                amount_due=Sum('charge_to_admin')
            )
            
            is_paid = False
            patients_count = patients_data['patients_count'] or 0
            amount_due = float(patients_data['amount_due'] or 0.00)
        
        # Get historical payment data (last 6 months)
        last_six_months = (
            DoctorPayment.objects
            .filter(doctor=request.user)
            .order_by('-year', '-month')
            .values('month', 'year', 'amount', 'is_paid', 'payment_date')[:6]
        )
        
        # Calculate totals for dashboard
        totals = PatientRegister.objects.filter(
            user=request.user
        ).aggregate(
            all_time_patients=Count('id'),
            all_time_payments=Sum('charge_to_admin'),
            unpaid_patients=Count('id', filter=Q(
                created_at__month=current_month,
                created_at__year=current_year,
                monthlydoctorpayment__paid=False
            )),
            paid_patients=Count('id', filter=Q(
                monthlydoctorpayment__paid=True
            ))
        )
        
        response_data = {
            'current_month': {
                'month': current_month,
                'year': current_year,
                'patients_count': patients_count,
                'amount_due': amount_due,
                'is_paid': is_paid,
                'charge_per_patient': 20.00,  # This could be dynamic if needed
                'payment_deadline': datetime(current_year, current_month, 10).strftime('%Y-%m-%d'),  # 10th of each month
            },
            'payment_history': list(last_six_months),
            'totals': {
                'all_time_patients': totals['all_time_patients'] or 0,
                'all_time_payments': float(totals['all_time_payments'] or 0.00),
                'unpaid_patients': totals['unpaid_patients'] or 0,
                'paid_patients': totals['paid_patients'] or 0,
            },
            'payment_instructions': "Please make payment to admin to continue full access",
        }
        
        return Response(response_data, status=status.HTTP_200_OK)