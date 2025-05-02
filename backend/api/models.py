# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import datetime

class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    hospital_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    referred_by = models.CharField(max_length=255, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
 

    last_daily_login = models.DateField(null=True, blank=True)

    USERNAME_FIELD = "email"  # Login with email instead of username
    REQUIRED_FIELDS = ["username"]  # Username is required but not unique

    def __str__(self):
        return self.username

class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + datetime.timedelta(minutes=5)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"




class PatientRegister(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=225,null=True,blank=True)
    last_name = models.CharField(max_length=225,null=True,blank=True)
    email = models.EmailField(null=True,blank=True)
    phone = models.CharField(max_length=14,null=True,blank=True)
    aadhar = models.CharField(max_length=18,null=True,blank=True)
    address = models.CharField(max_length=225,null=True,blank=True)
    gender = models.CharField(max_length=25,null=True,blank=True)
    disease = models.CharField(max_length=225,null=True,blank=True)
    date = models.CharField(max_length=225,null=True,blank=True)
    weight = models.CharField(max_length=225,null=True,blank=True)
    other_disease = models.CharField(max_length=225,null=True,blank=True)
    day = models.CharField(max_length=225,null=True,blank=True)
    month = models.CharField(max_length=225,null=True,blank=True)
    year = models.CharField(max_length=225,null=True,blank=True)
    age = models.CharField(max_length=225,null=True,blank=True)
    amount = models.CharField(max_length=225,null=True,blank=True)
    temparature = models.CharField(max_length=25,null=True,blank=True)
    appointment = models.CharField(max_length=225,null=True,blank=True)
    patientType = models.CharField(max_length=225,null=True,blank=True)
    bed_assign =  models.CharField(max_length=225,default='No')
    paymentType = models.CharField(max_length=225,null=True,blank=True)
    bp = models.CharField(max_length=225,null=True,blank=True)

    status = models.CharField(max_length=50,choices=STATUS_CHOICES, default="Pending")


    charge_to_admin = models.DecimalField(max_digits=6, decimal_places=2, default=20.00)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} - {self.user.email}"
    


class MedicalRecord(models.Model):
    patient = models.ForeignKey(PatientRegister, on_delete=models.CASCADE, related_name="medical_records")
    doctorAdvice = models.CharField(max_length=225, null=True, blank=True)
    tablets = models.JSONField(default=dict, blank=True, null=True)
    syrups = models.JSONField(default=dict, blank=True, null=True)
    ointments = models.JSONField(default=dict, blank=True, null=True)
    injections = models.JSONField(default=dict, blank=True, null=True)
    tests = models.JSONField(default=dict, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record for {self.patient.first_name} on {self.date}"
    

class LabTest(models.Model):
    patient = models.ForeignKey(PatientRegister, on_delete=models.CASCADE, related_name="lab_tests")
    testName = models.CharField(max_length=255)
    testDate = models.DateField()
    status = models.CharField(max_length=50, default="pending")  # pending, completed
    price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    testType = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return f"{self.testName} - {self.patient}"




from django.db import models
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

User = get_user_model()

class TicketModel(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    admin_response = models.TextField(blank=True, null=True)
    attachment = models.FileField(upload_to='ticket_attachments/', null=True, blank=True)

    def save(self, *args, **kwargs):
        # If status is being updated to resolved, set resolved_at
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
            self.send_resolution_email()
        super().save(*args, **kwargs)
        
        # Send email notifications on creation
        if self._state.adding:
            self.send_creation_emails()

    def send_creation_emails(self):
        # Email to user
        user_subject = f"Ticket #{self.id} Created: {self.title}"
        user_message = f"""
        Hello {self.created_by.email},
        
        Thank you for raising a ticket with us. Here are the details:
        
        Ticket ID: #{self.id}
        Title: {self.title}
        Priority: {self.get_priority_display()}
        Description: {self.description}
        
        Our team will get back to you shortly.
        
        Regards,
        Support Team
        """
        send_mail(
            user_subject,
            user_message,
            settings.DEFAULT_FROM_EMAIL,
            [self.created_by.email],
            fail_silently=True,
        )
        
        # Email to admin
        admin_subject = f"New Ticket #{self.id}: {self.title}"
        admin_message = f"""
        New ticket created by {self.created_by.email}:
        
        Ticket ID: #{self.id}
        Title: {self.title}
        Priority: {self.get_priority_display()}
        Description: {self.description}
        
        Please review and respond.
        """
        admin_emails = User.objects.filter(is_staff=True).values_list('email', flat=True)
        send_mail(
            admin_subject,
            admin_message,
            settings.DEFAULT_FROM_EMAIL,
            admin_emails,
            fail_silently=True,
        )

    def send_resolution_email(self):
        subject = f"Your Ticket #{self.id} has been resolved"
        message = f"""
        Hello {self.created_by.email},
        
        Your ticket has been resolved by our support team:
        
        Ticket ID: #{self.id}
        Title: {self.title}
        
        Resolution Details:
        {self.admin_response}
        
        Thank you for your patience.
        
        Regards,
        Support Team
        """
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [self.created_by.email],
            fail_silently=True,
        )

    def __str__(self):
        return f"Ticket #{self.id} - {self.title}"


class LabReport(models.Model):
    patient = models.ForeignKey(PatientRegister, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lab_tests')
    file = models.FileField(upload_to='lab_reports/',null=True,blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    patientName = models.CharField(max_length=225,null=True,blank=True)
    phone = models.CharField(max_length=225,null=True,blank=True)
    price = models.CharField(max_length=225,null=True,blank=True)
    status = models.CharField(max_length=225,null=True,blank=True)
    testDate = models.CharField(max_length=225,null=True,blank=True)
    testName = models.CharField(max_length=225,null=True,blank=True)
    testType = models.CharField(max_length=225,null=True,blank=True)

    def __str__(self):
        return self.patientName


class AvailableTest(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
 


from django.utils import timezone

class MonthlyDoctorPayment(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="monthly_payments")
    year = models.IntegerField()
    month = models.IntegerField()
    total_patients = models.PositiveIntegerField(default=0)
    patients_paid = models.PositiveIntegerField(default=0)
    patients_pending = models.PositiveIntegerField(default=0)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_pending = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    patients_registered = models.IntegerField(default=0)
    paid_patient_count = models.IntegerField(default=0)
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('doctor', 'year', 'month')
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.doctor.email} - {self.month}/{self.year} - Paid: {self.paid}"


class DoctorPayment(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    patients_count = models.PositiveIntegerField()
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('doctor', 'month', 'year')
        ordering = ['-year', '-month']
    
    def __str__(self):
        return f"{self.doctor.email} - {self.month}/{self.year} - {'Paid' if self.is_paid else 'Unpaid'}"


class Tablet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)

class Injection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)

class Ointment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)

class Syrup(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)

class LabTestInput(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)




# info@solutiongraphs.com