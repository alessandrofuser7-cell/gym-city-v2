#!/usr/bin/env python3
"""
Gym City Pescara - New Features Testing
Tests for:
1. Subscription expiry banner (user vs admin)
2. Admin dashboard Scadenze tab with Export CSV
3. Backend APIs for expiring subscriptions and cron status
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')

# Test credentials
ADMIN_CREDENTIALS = {"email": "admin@gymcity.com", "password": "newadmin123"}
USER_CREDENTIALS = {"email": "mario.rossi@example.com", "password": "user123"}


class TestAuthentication:
    """Test login functionality"""
    
    def test_user_login_returns_subscription_expiry(self):
        """User login should return subscriptionExpiry field"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=USER_CREDENTIALS)
        assert response.status_code == 200
        
        data = response.json()
        assert "user" in data
        assert "subscriptionExpiry" in data["user"]
        assert data["user"]["subscriptionExpiry"] is not None
        assert data["user"]["role"] == "user"
        print(f"✅ User subscriptionExpiry: {data['user']['subscriptionExpiry']}")
    
    def test_admin_login_has_no_subscription_expiry(self):
        """Admin login should have null subscriptionExpiry"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        assert response.status_code == 200
        
        data = response.json()
        assert "user" in data
        assert data["user"]["subscriptionExpiry"] is None
        assert data["user"]["role"] == "admin"
        print("✅ Admin has no subscriptionExpiry (null)")


class TestExpiringSubscriptionsAPI:
    """Test /api/admin/expiring-subscriptions endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")
    
    def test_expiring_subscriptions_returns_correct_structure(self, admin_token):
        """API should return 3 categories: expired, expiringIn7Days, expiringIn30Days"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/expiring-subscriptions", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "expired" in data
        assert "expiringIn7Days" in data
        assert "expiringIn30Days" in data
        
        # All should be lists
        assert isinstance(data["expired"], list)
        assert isinstance(data["expiringIn7Days"], list)
        assert isinstance(data["expiringIn30Days"], list)
        
        print(f"✅ Expired: {len(data['expired'])}, 7 days: {len(data['expiringIn7Days'])}, 30 days: {len(data['expiringIn30Days'])}")
    
    def test_mario_rossi_in_expiring_list(self, admin_token):
        """Mario Rossi should appear in one of the expiring lists"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/expiring-subscriptions", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Find Mario Rossi in any list
        all_users = data["expired"] + data["expiringIn7Days"] + data["expiringIn30Days"]
        mario = next((u for u in all_users if u["email"] == "mario.rossi@example.com"), None)
        
        assert mario is not None, "Mario Rossi should be in expiring subscriptions"
        assert mario["name"] == "Mario Rossi"
        assert "subscriptionExpiry" in mario
        print(f"✅ Found Mario Rossi with expiry: {mario['subscriptionExpiry']}")
    
    def test_expiring_subscriptions_requires_admin(self):
        """Non-admin should not access this endpoint"""
        # Login as user
        user_response = requests.post(f"{BASE_URL}/api/auth/login", json=USER_CREDENTIALS)
        if user_response.status_code != 200:
            pytest.skip("User login failed")
        
        user_token = user_response.json().get("token")
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/expiring-subscriptions", headers=headers)
        assert response.status_code == 403, "Non-admin should get 403 Forbidden"
        print("✅ Non-admin correctly denied access")


class TestCronStatusAPI:
    """Test /api/admin/cron-status endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")
    
    def test_cron_status_returns_jobs(self, admin_token):
        """API should return list of cron jobs"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/cron-status", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "jobs" in data
        assert "status" in data
        assert isinstance(data["jobs"], list)
        assert len(data["jobs"]) >= 2, "Should have at least 2 cron jobs"
        
        # Check job structure
        for job in data["jobs"]:
            assert "name" in job
            assert "schedule" in job
            assert "frequency" in job
        
        print(f"✅ Found {len(data['jobs'])} cron jobs, status: {data['status']}")
    
    def test_cron_status_requires_admin(self):
        """Non-admin should not access this endpoint"""
        # Login as user
        user_response = requests.post(f"{BASE_URL}/api/auth/login", json=USER_CREDENTIALS)
        if user_response.status_code != 200:
            pytest.skip("User login failed")
        
        user_token = user_response.json().get("token")
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/cron-status", headers=headers)
        assert response.status_code == 403, "Non-admin should get 403 Forbidden"
        print("✅ Non-admin correctly denied access")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
