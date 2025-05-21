// src/pages/ProfilePage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { updateProfile } from '../services/authService'; // Assume this service exists or create it

type FormData = {
  firstname: string;
  lastname:string;
  email: string;
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      firstname: user?.firstname || '',
      lastname: user?.lastname,
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateProfile(data); // Assume updateProfile is defined in authService.ts
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    }
  };

  if (loading) return <DashboardLayout title="Profile"><div>Loading...</div></DashboardLayout>;
  if (!user) return <DashboardLayout title="Profile"><div>User not found</div></DashboardLayout>;

  return (
    <DashboardLayout title="Profile">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
      <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            {...register('firstname', { required: 'firstname is required' })}
            id="firstname"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.firstname && <p className="mt-2 text-sm text-red-600">{errors.firstname.message}</p>}
        </div> <div>
          <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            {...register('lastname', { required: 'lastname is required' })}
            id="lastname"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.lastname && <p className="mt-2 text-sm text-red-600">{errors.lastname.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            id="email"
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Update Profile
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
