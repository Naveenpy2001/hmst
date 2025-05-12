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
import io




User = get_user_model()

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp = random.randint(100000, 999999)
            OTP.objects.create(user=user, otp=otp)
            
            # HTML email content with inline CSS
            subject = "Verify Your Account - OTP Code"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>OTP Verification</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #4a6fa5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                    <h1 style="margin: 0;">Account Verification</h1>
                </div>
                
                <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; border: 1px solid #ddd;">
                    <p>Hello {user.email},</p>
                    <p>Thank you for registering. Please use the following OTP to verify your account:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; padding: 10px 20px; background-color: #4a6fa5; color: white; font-size: 24px; font-weight: bold; border-radius: 5px;">
                            {otp}
                        </span>
                    </div>
                    
                    <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #777;">
                        © TSAR-IT Pvt Ltd · {settings.DEFAULT_FROM_EMAIL}
                    </p>
                </div>
            </body>
            </html>
            """
            
            # Plain text version for email clients that don't support HTML
            plain_message = f"""
            Hello {user.email},
            
            Thank you for registering. Please use the following OTP to verify your account:
            
            OTP: {otp}
            
            This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
            
            © TSAR-IT Pvt Ltd · {settings.DEFAULT_FROM_EMAIL}
            """
            
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_content,
                fail_silently=False
            )
            
            return Response(
                {"message": "User registered successfully. Please check your email for OTP."},
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
            
            # Delete any existing OTPs for this user
            OTP.objects.filter(user=user).delete()
            
            # Generate new OTP
            otp = random.randint(100000, 999999)
            OTP.objects.create(user=user, otp=otp)
            print(otp)
            # HTML email template with inline CSS
            subject = "Your New Verification Code"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>New OTP Verification</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #4a6fa5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                    <h1 style="margin: 0;">New Verification Code</h1>
                </div>
                
                <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; border: 1px solid #ddd;">
                    <p>Hello {user.email},</p>
                    <p>As requested, here is your new verification code:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; padding: 10px 20px; background-color: #4a6fa5; color: white; font-size: 24px; font-weight: bold; border-radius: 5px;">
                            {otp}
                        </span>
                    </div>
                    
                    <p>This code will expire in 10 minutes. If you didn't request this, please secure your account.</p>
                    
                    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                        <p>© TSAR-IT Pvt Ltd</p>
                        <p>Need help? Contact us at {settings.DEFAULT_FROM_EMAIL}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text fallback
            plain_message = f"""
            Hello {user.email},
            
            As requested, here is your new verification code:
            
            OTP: {otp}
            
            This code will expire in 10 minutes. If you didn't request this, please secure your account.
            
            © TSAR-IT Pvt Ltd
            Support: {settings.DEFAULT_FROM_EMAIL}
            """
            
            # Send email
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_content,
                fail_silently=False
            )
            
            return Response(
                {
                    "message": "New OTP has been sent to your email.",
                    "status": "otp_resent",
                    "email": user.email
                },
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {"error": "No account found with this email address."},
                status=status.HTTP_404_NOT_FOUND
            )

class UserLoginView(APIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        email = serializer.validated_data["email"]
        
        try:
            user = User.objects.get(email=email)
            
            # Delete any existing OTPs for password reset
            OTP.objects.filter(user=user, purpose="password_reset").delete()
            
            # Generate new OTP
            otp = random.randint(100000, 999999)
            OTP.objects.create(user=user, otp=otp, purpose="password_reset")
            
            # HTML email template with inline CSS
            subject = "Password Reset Verification Code"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Password Reset</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #d9534f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                    <h1 style="margin: 0;">Password Reset Request</h1>
                </div>
                
                <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; border: 1px solid #ddd;">
                    <p>Hello {user.email},</p>
                    <p>We received a request to reset your password. Here's your verification code:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; padding: 10px 20px; background-color: #d9534f; color: white; font-size: 24px; font-weight: bold; border-radius: 5px;">
                            {otp}
                        </span>
                    </div>
                    
                    <p style="color: #d9534f; font-weight: bold;">This code will expire in 5 minutes.</p>
                    <p>If you didn't request a password reset, please ignore this email or contact support immediately.</p>
                    
                    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                        <p>For security reasons, we don't store your password. You can only reset it using this verification code.</p>
                        <p>© TSAR-IT Pvt Ltd | <a href="mailto:{settings.SUPPORT_EMAIL}" style="color: #d9534f;">Need help?</a></p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text fallback
            plain_message = f"""
            Password Reset Request
            
            Hello {user.email},
            
            We received a request to reset your password. Here's your verification code:
            
            OTP: {otp}
            
            This code will expire in 5 minutes.
            
            If you didn't request a password reset, please ignore this email or contact support immediately.
            
            For security reasons, we don't store your password. You can only reset it using this verification code.
            
            © TSAR-IT Pvt Ltd
            Support: {settings.DEFAULT_FROM_EMAIL}
            """
            
            # Send email
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_content,
                fail_silently=False
            )
            
            return Response(
                {
                    "message": "Password reset OTP sent to your email.",
                    "status": "otp_sent",
                    "email": user.email
                },
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            # Don't reveal whether email exists for security
            return Response(
                {"message": "If this email exists in our system, you'll receive a password reset OTP."},
                status=status.HTTP_200_OK
            )


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
        patient.status = 'In Progress'
        patient.save()


from rest_framework.parsers import MultiPartParser, FormParser

class LabTestViewSet(viewsets.ModelViewSet):
    serializer_class = LabTestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return LabTest.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        patient_id = self.request.data.get('patient_id')
        if not patient_id:
            raise serializers.ValidationError({"patient_id": "This field is required."})
        
        try:
            patient = PatientRegister.objects.get(id=patient_id, user=self.request.user)
        except PatientRegister.DoesNotExist:
            raise serializers.ValidationError({"patient_id": "Invalid or unauthorized patient."})

        serializer.save(patient=patient)

    @action(detail=True, methods=['get'], url_path='lab-pdf')
    def generate_pdf(self, request, pk=None):
        lab_test = self.get_object()
        user = request.user

        # Render your HTML template with lab test context
        html_string = render_to_string('labtest_pdf_template.html', {
            'lab_test': lab_test,
            'user': user
        })

        # Path to wkhtmltopdf.exe (only needed on Windows, or if not in PATH)
        path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'  # Adjust as needed
        config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

        try:
            pdf = pdfkit.from_string(html_string, False, configuration=config)
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="labtest_{lab_test.id}.pdf"'
            return response
        except Exception as e:
            return Response({'error': f'PDF generation failed: {str(e)}'}, status=500)

import pdfkit
from django.template.loader import render_to_string
from django.http import HttpResponse

class PharmacyViewSet(viewsets.ModelViewSet):
    serializer_class = PharmacySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pharmacy.objects.filter(patient__user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        patient_id = self.request.data.get('patient_id')
        if not patient_id:
            raise serializers.ValidationError({"patient_id": "This field is required."})
        
        try:
            patient = PatientRegister.objects.get(id=patient_id, user=self.request.user)
        except PatientRegister.DoesNotExist:
            raise serializers.ValidationError({"patient_id": "Invalid or unauthorized patient."})
        
        # Save the pharmacy record
        serializer.save(patient=patient)

        # Update patient status to 'completed'
        patient.status = "Completed"
        patient.save()

    @action(detail=True, methods=['get'], url_path='pharmacy-pdf')
    def generate_pdf(self, request, pk=None):
        pharmacy = get_object_or_404(Pharmacy, pk=pk)
        template_path = 'pharmacy.html'
        print(pharmacy.patient)
        context = {
            'pharmacy': pharmacy,
            'user': request.user
        }

        html = render_to_string(template_path, context)

        # Provide path to wkhtmltopdf if needed
        path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
        config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

        try:
            pdf = pdfkit.from_string(html, False, configuration=config)
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename=pharmacy_record_{pharmacy.id}.pdf'
            return response
        except Exception as e:
            return Response({'error': f'PDF generation failed: {str(e)}'}, status=500)

# The action in your view to generate the PDF ----- main view for see full details of a single user
from django.db.models import Q

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
        completed = self.get_queryset().filter(
            Q(status='Completed') | Q(status='In Progress')
             )
        serializer = self.get_serializer(completed, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        patient = get_object_or_404(PatientRegister, pk=pk, user=request.user)
        medical_records = MedicalRecord.objects.filter(patient=patient)

        context = {
            'patient': patient,
            'medical_records': medical_records,
            'user': request.user
        }

        # Render the HTML from template
        html = render_to_string('pdf_template.html', context)

        # Configure wkhtmltopdf (required on Windows)
        path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'  # Change if needed
        config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

        try:
            pdf = pdfkit.from_string(html, False, configuration=config)
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="patient_{patient.id}_report.pdf"'
            return response
        except Exception as e:
            return Response({'error': f'PDF generation failed: {str(e)}'}, status=500)


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

import csv
import os
import pandas as pd
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




# admin

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import viewsets
from django.utils import timezone
from datetime import datetime
from django.db.models import Sum, Count, Q
from .models import User, PatientRegister, MonthlyDoctorPayment
from .serializers import MonthlyPaymentUpdateSerializer
from .permissions import IsDoctorPaidThisMonth

class AdminDoctorPatientStatsView(APIView):
    permission_classes = [IsAdminUser] 

    def get(self, request):
        # Get all doctors with their patient counts and amounts due
        doctors = (
            User.objects
            .filter(patientregister__isnull=False)
            .annotate(
                total_patients=Count('patientregister'),
                amount_paid_to_admin=Sum('patientregister__charge_to_admin')
            )
            .values('id', 'email', 'total_patients', 'amount_paid_to_admin','username','last_daily_login','created_at','is_active')
        )

        # Get monthly stats for each doctor
        monthly_stats = {}
        for payment in MonthlyDoctorPayment.objects.all():
            key = f"{payment.doctor_id}_{payment.year}_{payment.month}"
            monthly_stats[key] = {
                'patients_count': payment.total_patients,
                'amount_due': payment.total_patients * 20,
                'paid': payment.paid
            }

        # Format response
        result = []
        for entry in doctors:
            doctor_id = entry['id']
            # Get all months with data for this doctor
            doctor_months = MonthlyDoctorPayment.objects.filter(
                doctor_id=doctor_id
            ).order_by('-year', '-month')
            
            monthly_data = []
            for month_data in doctor_months:
                monthly_data.append({
                    'month': month_data.month,
                    'year': month_data.year,
                    'patients_count': month_data.total_patients,
                    'amount_due': month_data.total_patients * 20,
                    'paid': month_data.paid,
                    'payment_date': month_data.payment_date
                })

            result.append({
                "doctor_id": doctor_id,
                "doctor_email": entry['email'],
                "total_patients": entry['total_patients'],
                "total_amount_due": float(entry['amount_paid_to_admin'] or 0),
                'username': entry['username'],
                'last_daily_login': entry['last_daily_login'],
                'created_at': entry['created_at'],
                'is_active': entry.get('is_active', False),  # Add this field to track account status
                'monthly_stats': monthly_data
            })

        return Response(result)


class ToggleDoctorStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            doctor = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "Doctor not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        doctor.is_active = not doctor.is_active
        doctor.save()
        return Response(
            {"message": f"Doctor {'activated' if doctor.is_active else 'deactivated'}"},
            status=status.HTTP_200_OK
        )

class DoctorMonthlyStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Get all monthly records grouped by doctor
        doctors = User.objects.filter(patientregister__isnull=False).distinct()
        response_data = []
        
        for doctor in doctors:
            records = MonthlyDoctorPayment.objects.filter(
                doctor=doctor
            ).order_by('-year', '-month')
            
            doctor_data = {
                'doctor_id': doctor.id,
                'doctor_email': doctor.email,
                'monthly_stats': []
            }
            
            for r in records:
                doctor_data['monthly_stats'].append({
                    "month": r.month,
                    "year": r.year,
                    "patients_registered": r.total_patients,
                    "amount_due": r.total_patients * 20,
                    "amount_paid": r.amount_paid,
                    "paid": r.paid,
                    "payment_date": r.payment_date,
                    "is_active": r.doctor.is_active  # Account status
                })
            
            response_data.append(doctor_data)
        
        return Response(response_data)

from decimal import Decimal

from rest_framework.exceptions import NotFound

class AdminMonthlyPaymentViewSet(viewsets.ModelViewSet):
    queryset = MonthlyDoctorPayment.objects.all()
    serializer_class = MonthlyPaymentUpdateSerializer
    permission_classes = [IsAdminUser]

    def partial_update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except NotFound:
            return Response(
                {"error": "MonthlyDoctorPayment with this ID does not exist."},
                status=404
            )

        # Handle payment update
        if 'amount_paid' in request.data:
            try:
                new_payment = Decimal(str(request.data.get('amount_paid')))
            except (TypeError, ValueError):
                return Response({"error": "Invalid amount format"}, status=400)

            total_due = Decimal(instance.total_patients * 20)
            updated_total_paid = instance.amount_paid + new_payment

            if updated_total_paid > total_due:
                return Response(
                    {"error": "Overpayment not allowed", "max_allowed": str(total_due - instance.amount_paid)},
                    status=400
                )

            instance.amount_paid = updated_total_paid
            instance.paid = instance.amount_paid >= total_due

            if instance.paid:
                instance.payment_date = timezone.now()
                instance.doctor.is_active = True
                instance.doctor.save()

            instance.save()

        # Handle doctor active status toggle if provided
        if 'is_active' in request.data:
            instance.doctor.is_active = request.data.get('is_active')
            instance.doctor.save()

        serializer = self.get_serializer(instance)

        amount_due = Decimal(instance.total_patients * 20)
        amount_pending = amount_due - instance.amount_paid
        per_patient_cost = Decimal("20")
        unpaid_patients = int(amount_pending / per_patient_cost) if per_patient_cost > 0 else 0

        return Response({
            "payment": serializer.data,
            "amount_due": float(amount_due),
            "amount_paid": float(instance.amount_paid),
            "amount_pending": float(amount_pending),
            "unpaid_patients": unpaid_patients
        })


class DoctorPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now()
        current_month = today.month
        current_year = today.year
        
        # Get current month's data
        try:
            current_payment = MonthlyDoctorPayment.objects.get(
                doctor=request.user,
                month=current_month,
                year=current_year
            )
        except MonthlyDoctorPayment.DoesNotExist:
            # Create new record if doesn't exist
            patient_count = PatientRegister.objects.filter(
                user=request.user,
                created_at__month=current_month,
                created_at__year=current_year
            ).count()
            
            current_payment = MonthlyDoctorPayment.objects.create(
                doctor=request.user,
                month=current_month,
                year=current_year,
                total_patients=patient_count,
                amount_paid=0,
                paid=False
            )
        
        # Get historical data
        payments = MonthlyDoctorPayment.objects.filter(
            doctor=request.user
        ).exclude(
            month=current_month,
            year=current_year
        ).order_by('-year', '-month')
        
        # Prepare response
        data = {
            'current_month': {
                "month": current_payment.month,
                "year": current_payment.year,
                "total_patients": current_payment.total_patients,
                "amount_due": current_payment.total_patients * 20,
                "amount_paid": float(current_payment.amount_paid),
                "amount_pending": (current_payment.total_patients * 20) - current_payment.amount_paid,
                "paid": current_payment.paid,
                "updated_at": current_payment.updated_at,
                "account_active": request.user.is_active
            },
            'history': []
        }
        
        for payment in payments:
            data['history'].append({
                "month": payment.month,
                "year": payment.year,
                "total_patients": payment.total_patients,
                "amount_due": payment.total_patients * 20,
                "amount_paid": float(payment.amount_paid),
                "paid": payment.paid,
                "payment_date": payment.payment_date,
                "updated_at": payment.updated_at
            })
        
        return Response(data)


class MonthlyDoctorPaymentReset(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """
        Admin endpoint to reset monthly counts on 1st of each month
        """
        today = timezone.now()
        if today.day != 1:
            return Response(
                {"error": "This can only be run on the 1st of the month"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get previous month
        prev_month = today.month - 1 if today.month > 1 else 12
        prev_year = today.year if today.month > 1 else today.year - 1
        
        # Create new records for current month for all doctors
        doctors = User.objects.filter(patientregister__isnull=False).distinct()
        created_count = 0
        
        for doctor in doctors:
            # Check if record already exists
            if not MonthlyDoctorPayment.objects.filter(
                doctor=doctor,
                month=today.month,
                year=today.year
            ).exists():
                # Create new record with 0 patients
                MonthlyDoctorPayment.objects.create(
                    doctor=doctor,
                    month=today.month,
                    year=today.year,
                    total_patients=0,
                    amount_paid=0,
                    paid=False
                )
                created_count += 1
        
        return Response({
            "message": f"Created {created_count} new monthly records",
            "month": today.month,
            "year": today.year
        })

