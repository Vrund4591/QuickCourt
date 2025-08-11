const LoadingSpinner = ({ size = 'lg', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]} mx-auto`}
        />
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  )
}

export default LoadingSpinner
