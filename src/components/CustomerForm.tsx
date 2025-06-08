'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { Input, NumberInput } from './Input';
import { Customer } from '@/lib/types';
import { validateCustomer, getFieldError, ValidationError } from '@/lib/utils/formValidation';
import { generateId } from '@/lib/utils';

export interface CustomerFormProps {
  customer?: Customer; // For editing existing customer
  onSubmit: (customer: Customer) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

interface FormData {
  name: string;
  demand: string;
  sellingPrice: string;
}

export function CustomerForm({ customer, onSubmit, onCancel, disabled = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: customer?.name || '',
    demand: customer?.demand?.toString() || '',
    sellingPrice: customer?.sellingPrice?.toString() || ''
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!customer;

  // Reset form when customer prop changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        demand: customer.demand.toString(),
        sellingPrice: customer.sellingPrice.toString()
      });
    } else {
      setFormData({
        name: '',
        demand: '',
        sellingPrice: ''
      });
    }
    setErrors([]);
  }, [customer]);

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors.some(error => error.field === field)) {
      setErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const validation = validateCustomer({
      name: formData.name.trim(),
      demand: formData.demand,
      sellingPrice: formData.sellingPrice
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Create customer object
    const customerData: Customer = {
      id: customer?.id || generateId(),
      name: formData.name.trim(),
      demand: parseFloat(formData.demand),
      sellingPrice: parseFloat(formData.sellingPrice)
    };

    try {
      await onSubmit(customerData);
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: '',
          demand: '',
          sellingPrice: ''
        });
      }
      setErrors([]);
    } catch (error) {
      console.error('Error submitting customer:', error);
      // In a real app, you'd handle this error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditing && customer) {
      setFormData({
        name: customer.name,
        demand: customer.demand.toString(),
        sellingPrice: customer.sellingPrice.toString()
      });
    } else {
      setFormData({
        name: '',
        demand: '',
        sellingPrice: ''
      });
    }
    setErrors([]);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the customer information below' 
            : 'Enter the details for a new customer'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={getFieldError(errors, 'name')}
            placeholder="e.g., Store X, Retail Chain A"
            required
            disabled={disabled || isSubmitting}
            helperText="A descriptive name for this customer"
          />

          <NumberInput
            label="Demand Quantity"
            value={formData.demand}
            onChange={handleInputChange('demand')}
            error={getFieldError(errors, 'demand')}
            placeholder="80"
            min={0.01}
            step={0.01}
            required
            disabled={disabled || isSubmitting}
            helperText="Maximum units this customer wants to buy"
          />

          <NumberInput
            label="Selling Price per Unit"
            value={formData.sellingPrice}
            onChange={handleInputChange('sellingPrice')}
            error={getFieldError(errors, 'sellingPrice')}
            placeholder="25.00"
            min={0}
            step={0.01}
            required
            disabled={disabled || isSubmitting}
            helperText="Revenue per unit when selling to this customer (cj)"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={disabled || isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Adding...') 
                : (isEditing ? 'Update Customer' : 'Add Customer')
              }
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={disabled || isSubmitting}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}