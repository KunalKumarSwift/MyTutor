import type { Gender } from '@mytutor/contracts';
import { Field, RadioGroup, TextArea, TextInput } from '../../../components/ui';

export interface ProfileValues {
  name: string;
  email: string;
  dateOfBirth: string;
  gender: Gender | null;
  address: string;
  mobile: string;
}

export const EMPTY_PROFILE: ProfileValues = {
  name: '',
  email: '',
  dateOfBirth: '',
  gender: null,
  address: '',
  mobile: '',
};

export function validateProfile(v: ProfileValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!v.name.trim()) errors['name'] = 'Name is required.';
  if (!v.email.trim()) errors['email'] = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    errors['email'] = 'Enter a valid email address.';
  if (v.dateOfBirth && new Date(v.dateOfBirth) > new Date())
    errors['dateOfBirth'] = 'Date of birth cannot be in the future.';
  if (v.mobile && !/^\+?[0-9 ()-]{6,20}$/.test(v.mobile.trim()))
    errors['mobile'] = 'Enter a valid phone number.';
  return errors;
}

export function toProfileInput(v: ProfileValues) {
  return {
    name: v.name.trim(),
    email: v.email.trim(),
    dateOfBirth: v.dateOfBirth || null,
    gender: v.gender,
    address: v.address.trim() || null,
    mobile: v.mobile.trim() || null,
  };
}

/** Personal-information fields shared by My profile and the user editor (legacy profile screen). */
export function ProfileFields({
  values,
  errors,
  onChange,
}: {
  values: ProfileValues;
  errors: Record<string, string>;
  onChange: (v: ProfileValues) => void;
}) {
  const set = <K extends keyof ProfileValues>(k: K, value: ProfileValues[K]) =>
    onChange({ ...values, [k]: value });
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" error={errors['name']} required>
        <TextInput
          autoComplete="name"
          value={values.name}
          maxLength={100}
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>
      <Field label="Email" error={errors['email']} required>
        <TextInput
          type="email"
          autoComplete="email"
          value={values.email}
          maxLength={254}
          onChange={(e) => set('email', e.target.value)}
        />
      </Field>
      <Field label="Date of birth" error={errors['dateOfBirth']}>
        <TextInput
          type="date"
          value={values.dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => set('dateOfBirth', e.target.value)}
        />
      </Field>
      <Field label="Mobile" error={errors['mobile']}>
        <TextInput
          type="tel"
          autoComplete="tel"
          value={values.mobile}
          maxLength={20}
          onChange={(e) => set('mobile', e.target.value)}
        />
      </Field>
      <div className="sm:col-span-2">
        <RadioGroup<Gender>
          legend="Gender"
          name="gender"
          value={values.gender}
          onChange={(g) => set('gender', g)}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
          ]}
          error={errors['gender']}
        />
      </div>
      <Field label="Address" error={errors['address']} className="sm:col-span-2">
        <TextArea
          rows={2}
          autoComplete="street-address"
          value={values.address}
          maxLength={300}
          onChange={(e) => set('address', e.target.value)}
        />
      </Field>
    </div>
  );
}
