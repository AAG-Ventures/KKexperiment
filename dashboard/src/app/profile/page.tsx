"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [notification, setNotification] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [freeMonthsEarned, setFreeMonthsEarned] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate a unique referral link for the user
  useEffect(() => {
    // In a real application, this would come from a backend API
    const userId = 'u' + Math.random().toString(36).substring(2, 10);
    setReferralLink(`https://mindextension.app/signup?ref=${userId}`);
    
    // Simulate some referral data
    setReferralCount(5);
    setSuccessfulReferrals(2);
    setFreeMonthsEarned(2);
  }, []);

  // Function to copy referral link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopySuccess(true);
        setNotification('Referral link copied to clipboard!');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification('');
          setCopySuccess(false);
        }, 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setNotification('Failed to copy link. Please try again.');
      });
  };

  // Function to share referral link
  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Me on Mind Extension',
        text: 'Get 1 month free when you sign up using my referral link:',
        url: referralLink,
      })
      .then(() => setNotification('Shared successfully!'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      copyToClipboard();
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      color: 'var(--foreground-primary, #333)',
      backgroundColor: 'var(--background-primary, #f9f9f9)',
      position: 'relative'
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
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: copySuccess ? '#4CAF50' : '#ff9800',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {notification}
        </div>
      )}
      
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

        <div style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2>Referral Program</h2>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              backgroundColor: '#f9f5ff',
              border: '1px solid #e9d5ff',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>How it works:</p>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>Share your unique referral link with friends</li>
                <li style={{ marginBottom: '8px' }}>When they subscribe for at least one month, you both get 1 month free</li>
                <li style={{ marginBottom: '0' }}>There's no limit to how many friends you can refer!</li>
              </ul>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: '500', marginBottom: '10px' }}>Your Referral Stats:</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ textAlign: 'center', flex: '1', minWidth: '90px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#833DFF' }}>{referralCount}</p>
                  <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Total Referrals</p>
                </div>
                <div style={{ textAlign: 'center', flex: '1', minWidth: '90px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#833DFF' }}>{successfulReferrals}</p>
                  <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Successful</p>
                </div>
                <div style={{ textAlign: 'center', flex: '1', minWidth: '90px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#833DFF' }}>{freeMonthsEarned}</p>
                  <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>Free Months</p>
                </div>
              </div>
            </div>
            
            <p style={{ fontWeight: '500', marginBottom: '10px' }}>Your Referral Link:</p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{
                display: 'flex',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                padding: '8px 12px',
                alignItems: 'center',
                border: '1px solid #ddd',
                overflow: 'hidden'
              }}>
                <input 
                  type="text" 
                  value={referralLink} 
                  readOnly 
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    flexGrow: 1,
                    padding: '0',
                    fontSize: '14px',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    flex: '1',
                    backgroundColor: '#833DFF',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5V7C8 8.10457 8.89543 9 10 9H14C15.1046 9 16 8.10457 16 7V5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5H20C21.1046 5 22 5.89543 22 7V13C22 14.1046 21.1046 15 20 15H16C14.8954 15 14 14.1046 14 13V7C14 5.89543 14.8954 5 16 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copy Link
                </button>
                
                <button
                  onClick={shareReferralLink}
                  style={{
                    flex: '1',
                    backgroundColor: 'transparent',
                    color: '#833DFF',
                    border: '1px solid #833DFF',
                    padding: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
