import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getProfile, updateProfile } from '../../services/profileService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const schema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  phone:      z.string().optional(),
  department: z.string().optional(),
  position:   z.string().optional(),
});

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    getProfile()
      .then((res) => {
        const data = res?.data ?? res;
        setProfile(data);
        reset({
          name:       data?.name       ?? user?.name       ?? '',
          phone:      data?.phone      ?? user?.phone      ?? '',
          department: data?.department ?? user?.department ?? '',
          position:   data?.position   ?? user?.position   ?? '',
        });
      })
      .catch(() => {
        // Fallback to context user
        reset({
          name:       user?.name       ?? '',
          phone:      user?.phone      ?? '',
          department: user?.department ?? '',
          position:   user?.position   ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, [user, reset]);

  async function onSubmit(data) {
    try {
      await updateProfile(data);
      setProfile((prev) => ({ ...prev, ...data }));
      refreshUser({ ...data });
      toast.success('Profile updated successfully!');
      setEditing(false);
      reset(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    }
  }

  function cancelEdit() {
    const src = profile ?? user ?? {};
    reset({
      name:       src.name       ?? '',
      phone:      src.phone      ?? '',
      department: src.department ?? '',
      position:   src.position   ?? '',
    });
    setEditing(false);
  }

  const displayData = profile ?? user ?? {};

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">My Profile</h1>
        <p className="page-header-sub">View and update your personal information</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading profile…" />
      ) : (
        <div style={{ maxWidth: 800 }}>
          {/* Profile header */}
          <div className="profile-header">
            <div className="profile-avatar-lg" aria-hidden="true">
              {initials(displayData?.name ?? 'U')}
            </div>
            <div style={{ flex: 1 }}>
              <div className="profile-name">{displayData?.name ?? 'User'}</div>
              <div className="profile-role">
                {displayData?.position ?? displayData?.role ?? 'Employee'}
                {displayData?.department ? ` · ${displayData.department}` : ''}
              </div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{displayData?.email ?? user?.email}</div>
            </div>
            <button
              id="profile-edit-btn"
              className="btn btn-secondary"
              onClick={() => setEditing((e) => !e)}
              type="button"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              {editing ? <><X size={15} /> Cancel</> : <><Edit2 size={15} /> Edit Profile</>}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 20 }}>Personal Information</h2>

              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    className={`form-control${errors.name ? ' error' : ''}`}
                    disabled={!editing}
                    {...register('name')}
                  />
                  {errors.name && <span className="form-error" role="alert">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-email">Email Address</label>
                  <input
                    id="profile-email"
                    type="email"
                    className="form-control"
                    value={displayData?.email ?? user?.email ?? ''}
                    disabled
                    readOnly
                    aria-description="Email cannot be changed here"
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Contact admin to change your email
                  </span>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    className="form-control"
                    placeholder={editing ? '+91 98765 43210' : '—'}
                    disabled={!editing}
                    {...register('phone')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-department">Department</label>
                  <input
                    id="profile-department"
                    type="text"
                    className="form-control"
                    placeholder={editing ? 'e.g. Engineering' : '—'}
                    disabled={!editing}
                    {...register('department')}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-position">Position / Title</label>
                  <input
                    id="profile-position"
                    type="text"
                    className="form-control"
                    placeholder={editing ? 'e.g. Software Engineer' : '—'}
                    disabled={!editing}
                    {...register('position')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-role">Role</label>
                  <input
                    id="profile-role"
                    type="text"
                    className="form-control"
                    value={displayData?.role ?? user?.role ?? 'employee'}
                    disabled
                    readOnly
                    aria-description="Role is set by admin"
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Role is managed by admin
                  </span>
                </div>
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <button
                    id="profile-save-btn"
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !isDirty}
                  >
                    {isSubmitting
                      ? <><div className="spinner spinner-sm" /> Saving…</>
                      : <><Save size={15} /> Save Changes</>
                    }
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Read-only system info */}
          {!editing && (
            <div className="card" style={{ marginTop: 20 }}>
              <h2 className="card-title" style={{ marginBottom: 16 }}>Account Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Employee ID',  value: displayData?._id ?? displayData?.id ?? user?._id ?? '—' },
                  { label: 'Role',         value: displayData?.role ?? user?.role ?? 'employee' },
                  { label: 'Joined',       value: displayData?.createdAt ? new Date(displayData.createdAt).toLocaleDateString('en-IN') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
