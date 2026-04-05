#!/usr/bin/env python3
"""
Gym City Pescara - Backend API Testing Suite
Tests all endpoints according to the Italian gym booking system requirements
"""

import requests
import sys
import json
import time
from datetime import datetime, date, timedelta

class GymCityAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.instructor_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test credentials from the review request
        self.admin_credentials = {"email": "admin@gymcity.com", "password": "admin123"}
        self.user_credentials = {"email": "mario.rossi@example.com", "password": "user123"}
        self.instructor_credentials = {"email": "gianluca@gymcity.com", "password": "instructor123"}

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        if description:
            print(f"   📝 {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            result = {
                'test_name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success,
                'description': description
            }
            
            try:
                response_json = response.json()
                result['response'] = response_json
            except:
                result['response'] = response.text[:200] + "..." if len(response.text) > 200 else response.text
            
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                if hasattr(response, 'json'):
                    try:
                        json_data = response.json()
                        if isinstance(json_data, dict) and len(json_data) <= 3:
                            print(f"   📄 Response: {json.dumps(json_data, indent=2)}")
                    except:
                        pass
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   📄 Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   📄 Raw response: {response.text[:200]}")

            self.test_results.append(result)
            return success, result.get('response', {})

        except Exception as e:
            print(f"   ❌ FAILED - Exception: {str(e)}")
            result = {
                'test_name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': 'EXCEPTION',
                'success': False,
                'error': str(e),
                'description': description
            }
            self.test_results.append(result)
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        print("\n" + "="*60)
        print("🏥 HEALTH CHECK TESTS")
        print("="*60)
        
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200,
            description="Basic API connectivity test"
        )
        return success

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n" + "="*60)
        print("🌐 PUBLIC ENDPOINT TESTS")
        print("="*60)
        
        # Test courses endpoint
        success1, courses_response = self.run_test(
            "Get All Courses",
            "GET",
            "/api/courses",
            200,
            description="Retrieve list of available courses"
        )
        
        # Test schedule endpoint
        success2, schedule_response = self.run_test(
            "Get Weekly Schedule",
            "GET",
            "/api/schedule",
            200,
            description="Retrieve weekly class schedule"
        )
        
        # Test booking count (public endpoint)
        if success2 and schedule_response and len(schedule_response) > 0:
            schedule_id = schedule_response[0].get('id')
            test_date = date.today().strftime('%Y-%m-%d')
            
            if schedule_id:
                self.run_test(
                    "Get Booking Count",
                    "GET",
                    f"/api/bookings/count/{schedule_id}/{test_date}",
                    200,
                    description=f"Check booking count for schedule {schedule_id[:8]}..."
                )
        
        return success1 and success2

    def test_authentication(self):
        """Test login functionality with all user types"""
        print("\n" + "="*60)
        print("🔐 AUTHENTICATION TESTS")
        print("="*60)
        
        # Test admin login
        success1, admin_response = self.run_test(
            "Admin Login - Correct Credentials",
            "POST",
            "/api/auth/login",
            200,
            data=self.admin_credentials,
            description="Admin login with admin@gymcity.com / admin123"
        )
        
        if success1 and admin_response and 'token' in admin_response:
            self.admin_token = admin_response['token']
            print(f"   🔑 Admin token obtained successfully")
        
        # Test user login
        success2, user_response = self.run_test(
            "User Login - Correct Credentials",
            "POST",
            "/api/auth/login",
            200,
            data=self.user_credentials,
            description="User login with mario.rossi@example.com / user123"
        )
        
        if success2 and user_response and 'token' in user_response:
            self.user_token = user_response['token']
            print(f"   🔑 User token obtained successfully")
        
        # Test instructor login
        success3, instructor_response = self.run_test(
            "Instructor Login - Correct Credentials",
            "POST",
            "/api/auth/login",
            200,
            data=self.instructor_credentials,
            description="Instructor login with gianluca@gymcity.com / instructor123"
        )
        
        if success3 and instructor_response and 'token' in instructor_response:
            self.instructor_token = instructor_response['token']
            print(f"   🔑 Instructor token obtained successfully")
        
        # Test invalid credentials
        self.run_test(
            "Login - Invalid Credentials",
            "POST",
            "/api/auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"},
            description="Should reject invalid credentials"
        )
        
        # Test missing credentials
        self.run_test(
            "Login - Missing Password",
            "POST",
            "/api/auth/login",
            400,
            data={"email": "test@test.com"},
            description="Should require both email and password"
        )
        
        return success1 and success2

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        print("\n" + "="*60)
        print("👤 AUTHENTICATED USER TESTS")
        print("="*60)
        
        if not self.user_token:
            print("❌ Skipping authenticated tests - no user token available")
            return False
        
        # Test get current user
        success1, _ = self.run_test(
            "Get Current User Info",
            "GET",
            "/api/auth/me",
            200,
            token=self.user_token,
            description="Retrieve current user information"
        )
        
        # Test get user's bookings
        success2, bookings_response = self.run_test(
            "Get My Bookings",
            "GET",
            "/api/bookings/my",
            200,
            token=self.user_token,
            description="Retrieve user's booking history"
        )
        
        # Test unauthorized access
        self.run_test(
            "Unauthorized Access Test",
            "GET",
            "/api/auth/me",
            401,
            description="Should reject requests without token"
        )
        
        return success1 and success2

    def test_booking_functionality(self):
        """Test booking creation and cancellation"""
        print("\n" + "="*60)
        print("📅 BOOKING FUNCTIONALITY TESTS")
        print("="*60)
        
        if not self.user_token:
            print("❌ Skipping booking tests - no user token available")
            return False
        
        # Get schedule to find a valid schedule ID
        success, schedule_response = self.run_test(
            "Get Schedule for Booking",
            "GET",
            "/api/schedule",
            200,
            description="Get schedule to test booking functionality"
        )
        
        if not success or not schedule_response or len(schedule_response) == 0:
            print("❌ No schedule available for booking tests")
            return False
        
        schedule_id = schedule_response[0].get('id')
        tomorrow = (date.today() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Test create booking
        booking_success, booking_response = self.run_test(
            "Create Booking",
            "POST",
            "/api/bookings",
            201,
            data={"scheduleId": schedule_id, "date": tomorrow},
            token=self.user_token,
            description=f"Book class for {tomorrow}"
        )
        
        booking_id = None
        if booking_success and booking_response and 'id' in booking_response:
            booking_id = booking_response['id']
            print(f"   📝 Booking created with ID: {booking_id}")
        
        # Test duplicate booking (should fail)
        self.run_test(
            "Duplicate Booking (Should Fail)",
            "POST",
            "/api/bookings",
            400,
            data={"scheduleId": schedule_id, "date": tomorrow},
            token=self.user_token,
            description="Should prevent duplicate bookings"
        )
        
        # Test booking without authentication
        self.run_test(
            "Booking Without Auth (Should Fail)",
            "POST",
            "/api/bookings",
            401,
            data={"scheduleId": schedule_id, "date": tomorrow},
            description="Should require authentication"
        )
        
        # Test cancel booking
        cancel_success = False
        if booking_id:
            cancel_success, _ = self.run_test(
                "Cancel Booking",
                "DELETE",
                f"/api/bookings/{booking_id}",
                200,
                token=self.user_token,
                description=f"Cancel booking {booking_id[:8]}..."
            )
        
        return booking_success

    def test_admin_functionality(self):
        """Test admin-only endpoints"""
        print("\n" + "="*60)
        print("👑 ADMIN FUNCTIONALITY TESTS")
        print("="*60)
        
        if not self.admin_token:
            print("❌ Skipping admin tests - no admin token available")
            return False
        
        # Test get all users
        success1, users_response = self.run_test(
            "Admin - Get All Users",
            "GET",
            "/api/auth/users",
            200,
            token=self.admin_token,
            description="Admin retrieves user list"
        )
        
        if success1:
            print(f"   👥 Found {len(users_response) if users_response else 0} users")
        
        # Test create new user (unique email per run)
        unique_email = f"test.user.{int(time.time())}@gymcity.com"
        new_user_data = {
            "email": unique_email,
            "password": "test123",
            "name": "Test User",
            "phone": "1234567890",
            "role": "user"
        }
        
        success2, create_response = self.run_test(
            "Admin - Create New User",
            "POST",
            "/api/auth/users",
            201,
            data=new_user_data,
            token=self.admin_token,
            description="Admin creates new user account"
        )
        
        # Test admin access with user token (should fail)
        self.run_test(
            "User Access Admin Endpoint (Should Fail)",
            "GET",
            "/api/auth/users",
            403,
            token=self.user_token,
            description="Non-admin should be denied access"
        )
        
        return success1

    def test_instructor_functionality(self):
        """Test instructor-specific endpoints"""
        print("\n" + "="*60)
        print("📚 INSTRUCTOR FUNCTIONALITY TESTS")  
        print("="*60)
        
        if not self.instructor_token:
            print("❌ Skipping instructor tests - no instructor token available")
            return False
        
        # Test instructor access to bookings by date
        today_str = date.today().strftime('%Y-%m-%d')
        success, bookings_response = self.run_test(
            "Instructor - Get Bookings by Date",
            "GET",
            f"/api/bookings/date/{today_str}",
            200,
            token=self.instructor_token,
            description=f"Instructor views bookings for {today_str}"
        )
        
        return success

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        pass_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Pass Rate: {pass_rate:.1f}%")
        
        if pass_rate >= 80:
            print("🎉 EXCELLENT! Backend is working well")
        elif pass_rate >= 60:
            print("⚠️  GOOD with some issues that need attention")
        else:
            print("🚨 CRITICAL issues found - immediate attention needed")
        
        # Show failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                error_msg = test.get('error', f"Status {test.get('actual_status', 'unknown')}")
                print(f"   • {test['test_name']} - {error_msg}") 
        
        return pass_rate

def main():
    print("🏋️  Gym City Pescara - Backend API Test Suite")
    print("=" * 60)
    
    tester = GymCityAPITester()
    
    # Run all test suites
    health_ok = tester.test_health_check()
    if not health_ok:
        print("🚨 API Health check failed - stopping tests")
        return 1
    
    public_ok = tester.test_public_endpoints()
    auth_ok = tester.test_authentication()
    user_ok = tester.test_authenticated_endpoints()
    booking_ok = tester.test_booking_functionality()
    admin_ok = tester.test_admin_functionality()
    instructor_ok = tester.test_instructor_functionality()
    
    # Print final summary
    pass_rate = tester.print_summary()
    
    # Return appropriate exit code
    return 0 if pass_rate >= 70 else 1

if __name__ == "__main__":
    sys.exit(main())