import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createCategory } from '../../services/firestoreService';
import { auth } from '../../firebase';
import { useNotifications } from '../../contexts/NotificationContext';

// Default category images
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=500',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
  'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=500',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
];

// Get random default image
const getRandomDefaultImage = () => {
  return DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
};

const CreateCategoryDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { notify } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 120) {
      newErrors.description = 'Description must be 120 characters or less';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.imageUrl.trim() || getRandomDefaultImage(),
        slug: formData.name.toLowerCase().trim().replace(/\s+/g, '-'),
        createdBy: auth.currentUser.uid,
        isSystemCategory: false,
      };

      const result = await createCategory(categoryData);

      if (result.success) {
        notify({
          title: 'Category Created',
          message: `"${formData.name}" has been created successfully`,
          type: 'success',
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          imageUrl: '',
        });

        onSuccess();
        onClose();
      } else {
        notify({
          title: 'Error',
          message: result.error || 'Failed to create category',
          type: 'error',
        });
      }
    } catch (err) {
      notify({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Create Category</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Technology, Medicine, History"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#6B7A8F]'
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this category"
                  rows={4}
                  maxLength={120}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                    errors.description
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#6B7A8F]'
                  }`}
                  disabled={loading}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.description && (
                      <p className="text-red-500 text-xs">{errors.description}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/120
                  </p>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7A8F] transition-colors"
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.imageUrl ? 'Custom image' : 'Will use random default image'}
                  </p>
                  {!formData.imageUrl && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Auto
                    </span>
                  )}
                </div>

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getRandomDefaultImage();
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#6B7A8F] hover:bg-[#5a6675] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCategoryDrawer;
