import { useState } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ImageUpload = ({ images = [], onImagesChange, multiple = true, maxImages = 10 }) => {
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    
    if (!files.length) return

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        const response = await api.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        return response.data.imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImages = multiple ? [...images, ...uploadedUrls] : uploadedUrls
      onImagesChange(newImages)
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    onImagesChange(newImages)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Images {multiple && `(Max ${maxImages})`}
      </label>
      
      {/* Upload Area */}
      <div className="mb-4">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span>
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={uploading || images.length >= maxImages}
          />
        </label>
      </div>

      {/* Uploading Indicator */}
      {uploading && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Uploading images...
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUpload
