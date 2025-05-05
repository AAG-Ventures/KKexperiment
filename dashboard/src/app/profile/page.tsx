"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ProfilePage() {
  const [notification, setNotification] = useState('');

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      color: 'var(--foreground-primary, #333)',
      backgroundColor: 'var(--background-primary, #f9f9f9)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          color: '#833DFF',
          textDecoration: 'none',
          fontWeight: '500'
        }}>
          ← Back to Dashboard
        </Link>
        <div style={{ maxWidth: '120px' }}>
          <Image 
            src="/logo.png" 
            alt="Mind Extension Logo" 
            width={120} 
            height={35} 
            priority
            style={{
              objectFit: 'contain',
            }} 
          />
        </div>
      </div>
      
      {/* Profile Header */}
      <div style={{
        display: 'flex', 
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px'
        }}>👤</div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>User Name</h1>
          <p style={{ color: '#666', margin: '0' }}>Premium Account</p>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: '1 1 150px',
          backgroundColor: 'var(--card-bg, #fff)',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#833DFF' }}>12</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Projects</p>
        </div>
        <div style={{
          flex: '1 1 150px',
          backgroundColor: 'var(--card-bg, #fff)',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#833DFF' }}>247</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Files</p>
        </div>
        <div style={{
          flex: '1 1 150px',
          backgroundColor: 'var(--card-bg, #fff)',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#833DFF' }}>8</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Connected Agents</p>
        </div>
        <div style={{
          flex: '1 1 150px',
          backgroundColor: 'var(--card-bg, #fff)',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#833DFF' }}>74%</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Storage Used</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eee',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '10px 20px',
          borderBottom: '2px solid #833DFF',
          color: '#833DFF',
          fontWeight: '500'
        }}>Activity</div>
        <div style={{
          padding: '10px 20px',
          borderBottom: '2px solid transparent'
        }}>Projects</div>
        <div style={{
          padding: '10px 20px',
          borderBottom: '2px solid transparent'
        }}>Files</div>
        <div style={{
          padding: '10px 20px',
          borderBottom: '2px solid transparent'
        }}>Agents</div>
      </div>

      {/* Profile Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2>Recent Activity</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontWeight: '500' }}>Created new document "Project Overview"</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>Today, 10:30 AM</p>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🤖</div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontWeight: '500' }}>Configured new agent "Data Analyzer"</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>Yesterday, 3:45 PM</p>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔄</div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontWeight: '500' }}>Updated project "Marketing Campaign"</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>May 3, 2025</p>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💬</div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontWeight: '500' }}>Started new chat "Product Launch Ideas"</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>May 2, 2025</p>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📊</div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontWeight: '500' }}>Generated "Quarterly Report Analysis"</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>May 1, 2025</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2>Account Information</h2>
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Name:</strong> User Name</p>
            <p><strong>Email:</strong> user@example.com</p>
            <p><strong>Member Since:</strong> January 2025</p>
            <p><strong>Subscription:</strong> Premium Plan</p>
            <p><strong>Next Billing Date:</strong> June 1, 2025</p>
          </div>
          <button style={{
            backgroundColor: '#833DFF',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>Edit Account Information</button>
        </div>
        
        <div style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2>Usage Statistics</h2>
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Storage Used:</strong> 7.4 GB of 10 GB</p>
            <p><strong>Active Projects:</strong> 12</p>
            <p><strong>Completed Projects:</strong> 28</p>
            <p><strong>Connected Services:</strong> 3</p>
            <p><strong>Last Login:</strong> Today, 10:45 AM</p>
          </div>
          <div style={{
            height: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden',
            marginTop: '10px'
          }}>
            <div style={{
              width: '74%',
              height: '100%',
              backgroundColor: '#833DFF'
            }}></div>
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>74% of storage used</p>
        </div>
      </div>
    </div>
  );
}
