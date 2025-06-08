'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { Input, NumberInput } from './Input';
import { Supplier } from '@/lib/types';
import { validateSupplier, getFieldError, ValidationError } from '@/lib/utils/formValidation';
import { generateId } from '@/lib/utils';

export interface SupplierFormProps {
  supplier?: Supplier; // For editing existing supplier
  onSubmit: (supplier: Supplier) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

interface FormData {
  name: string;
  supply: string;
  purchaseCost: string;
}

export function SupplierForm({ supplier, onSubmit, onCancel, disabled = false }: SupplierFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: supplier?.name || '',
    supply: supplier?.supply?.toString() || '',
    purchaseCost: supplier?.purchaseCost?.toString() || ''
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!supplier;

  // Reset form when supplier prop changes
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        supply: supplier.supply.toString(),
        purchaseCost: supplier.purchaseCost.toString()
      });
    } else {
      setFormData({
        name: '',
        supply: '',
        purchaseCost: ''
      });
    }
    setErrors([]);
  }, [supplier]);

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
    const validation = validateSupplier({
      name: formData.name.trim(),
      supply: formData.supply,
      purchaseCost: formData.purchaseCost
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Create supplier object
    const supplierData: Supplier = {
      id: supplier?.id || generateId(),
      name: formData.name.trim(),
      supply: parseFloat(formData.supply),
      purchaseCost: parseFloat(formData.purchaseCost)
    };

    try {
      await onSubmit(supplierData);
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: '',
          supply: '',
          purchaseCost: ''
        });
      }
      setErrors([]);
    } catch (error) {
      console.error('Error submitting supplier:', error);
      // In a real app, you'd handle this error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditing && supplier) {
      setFormData({
        name: supplier.name,
        supply: supplier.supply.toString(),
        purchaseCost: supplier.purchaseCost.toString()
      });
    } else {
      setFormData({
        name: '',
        supply: '',
        purchaseCost: ''
      });
    }
    setErrors([]);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the supplier information below' 
            : 'Enter the details for a new supplier'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Supplier Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={getFieldError(errors, 'name')}
            placeholder="e.g., Factory A, Warehouse North"
            required
            disabled={disabled || isSubmitting}
            helperText="A descriptive name for this supplier"
          />

          <NumberInput
            label="Supply Quantity"
            value={formData.supply}
            onChange={handleInputChange('supply')}
            error={getFieldError(errors, 'supply')}
            placeholder="100"
            min={0.01}
            step={0.01}
            required
            disabled={disabled || isSubmitting}
            helperText="Maximum units this supplier can provide"
          />

          <NumberInput
            label="Purchase Cost per Unit"
            value={formData.purchaseCost}
            onChange={handleInputChange('purchaseCost')}
            error={getFieldError(errors, 'purchaseCost')}
            placeholder="10.50"
            min={0}
            step={0.01}
            required
            disabled={disabled || isSubmitting}
            helperText="Cost to buy one unit from this supplier (kzi)"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={disabled || isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Adding...') 
                : (isEditing ? 'Update Supplier' : 'Add Supplier')
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
            )}\n            
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