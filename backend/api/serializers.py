# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["username","email","password","hospital_name","phone_number","address","referred_by",]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ["otp"]

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"error": "Passwords do not match."})
        return data

    def save(self):
        email = self.validated_data["email"]
        new_password = self.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)  # ✅ Update password
            user.save()
        except User.DoesNotExist:
            raise serializers.ValidationError({"error": "User not found."})

        return {"message": "Password reset successfully!"}



class UserDetailSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=False, write_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile_photo','address','phone_number','hospital_name']




class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRegister
        fields = "__all__"
        read_only_fields = ["user"]



class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = '__all__'



# serializers.py
from rest_framework import serializers
from .models import MonthlyDoctorPayment

class AdminMonthlyPaymentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyDoctorPayment
        fields = ['id', 'doctor', 'month', 'year', 'paid', 'patients_registered', 'paid_patient_count']

    def update(self, instance, validated_data):
        instance.paid = validated_data.get('paid', instance.paid)
        instance.paid_patient_count = instance.patients_registered if instance.paid else instance.paid_patient_count
        instance.patients_registered = 0 if instance.paid else instance.patients_registered
        instance.save()
        return instance


from .models import MedicalRecord

class MedicalRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = MedicalRecord
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class PatientDetailSerializer(serializers.ModelSerializer):
    medical_records = MedicalRecordSerializer(many=True, read_only=True)
    lab_tests = LabTestSerializer(many=True, read_only=True)

    class Meta:
        model = PatientRegister
        fields = [
            'id', 'first_name', 'last_name', 'age', 'phone', 'disease',
            'gender', 'address', 'temparature', 'bp', 'appointment',
            'patientType', 'paymentType', 'medical_records','lab_tests','status'
        ]



# tickets/serializers.py
from rest_framework import serializers
from .models import TicketModel
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    
    class Meta:
        model = TicketModel
        fields = [
            'id', 'title', 'description', 'created_by_email', 
            'priority', 'status', 'created_at', 'updated_at',
            'resolved_at', 'admin_response', 'attachment'
        ]
        read_only_fields = [
            'id', 'created_by_email', 'status', 'created_at', 
            'updated_at', 'resolved_at', 'admin_response'
        ]

class CreateTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketModel
        fields = ['title', 'description', 'priority', 'attachment']
        
    def create(self, validated_data):
        request = self.context.get('request')
        ticket = TicketModel.objects.create(
            created_by=request.user,
            **validated_data
        )
        return ticket

class AdminTicketSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = TicketModel
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at','created_by_email', 'created_by_username']

    def update(self, instance, validated_data):
        if 'status' in validated_data and validated_data['status'] == 'resolved':
            if not validated_data.get('admin_response'):
                raise serializers.ValidationError("Admin response is required when resolving a ticket")
        return super().update(instance, validated_data)




from .models import Tablet, Injection, Ointment, Syrup, LabTest

class TabletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tablet
        fields = '__all__'

class InjectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Injection
        fields = '__all__'

class OintmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ointment
        fields = '__all__'

class SyrupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Syrup
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'


class LabTestTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabReport
        fields = '__all__'



class MonthlyPaymentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyDoctorPayment
        fields = ['id', 'doctor', 'year', 'month', 'total_patients', 
                 'patients_paid', 'patients_pending', 'amount_paid', 
                 'amount_pending', 'paid']
        read_only_fields = ['doctor', 'year', 'month', 'total_patients']


# Add to serializers.py
class DoctorPaymentSerializer(serializers.ModelSerializer):
    doctor_email = serializers.EmailField(source='doctor.email', read_only=True)
    doctor_name = serializers.CharField(source='doctor.username', read_only=True)
    doctor_phone = serializers.CharField(source='doctor.phone_number', read_only=True)
    
    class Meta:
        model = DoctorPayment
        fields = [
            'id', 'doctor', 'doctor_email', 'doctor_name', 'doctor_phone',
            'amount', 'patients_count', 'month', 'year', 'is_paid',
            'payment_date', 'created_at'
        ]
        read_only_fields = ['doctor', 'amount', 'patients_count', 'month', 'year']


class LabTestSerializerMain(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)  # Show username/email of the creator
    patient = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = LabReport
        fields = '__all__'
        extra_kwargs = {
            'file': {'required': False},
        }