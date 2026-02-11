"use client";
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { addSingleAsset } from '@/store/slices/Assets';
import { GalleryHorizontalIcon, ImageIcon, SwatchBookIcon, TextSelectionIcon, UploadCloud, Search, Filter, X } from 'lucide-react';
import ImageCard from '@/components/cards/ImageCard';
import PdfCard from '@/components/cards/PdfCard';

function AssetUploadPage() {
    const [assetType, setAssetType] = useState('image');
    const [asset, setAsset] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilter, setSearchFilter] = useState('all'); 
    const [filteredAssets, setFilteredAssets] = useState([]);

    const { assets } = useSelector((state) => state.assets);
    const { user } = useSelector((state) => state.user);
    const [userEmail, setUserEmail] = useState("");
    const [loadedAssets, setLoadedAssets] = useState([]);
    const [images, setImages] = useState([]);
    const [pdf, setPdf] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (assets && assets.length > 0) {
            let imageArray = assets[0].filter(item => item.type === 'image');
            let pdfArray = assets[0].filter(item => item.type === 'pdf');
            setImages(imageArray);
            setPdf(pdfArray);
            setLoadedAssets(assets[0]);
        }
        if (user) {
            setUserEmail(user.email);
        }
    }, [assets, user]);

    
    useEffect(() => {
        if (!loadedAssets || loadedAssets.length === 0) {
            setFilteredAssets([]);
            return;
        }

        let filtered = [...loadedAssets];

        
        if (searchFilter !== 'all') {
            filtered = filtered.filter(asset => asset.type === searchFilter);
        }

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(asset =>
                asset.name?.toLowerCase().includes(query) ||
                asset.description?.toLowerCase().includes(query)
            );
        }

        setFilteredAssets(filtered);
    }, [loadedAssets, searchQuery, searchFilter]);

    const handleFileChange = (file) => {
        const fileType = file?.type;

        if (file && fileType.includes(assetType)) {
            setAsset(file);
            setFilePreview(URL.createObjectURL(file));
            if (!name) {
                setName(file.name.split('.')[0]);
            }
        } else {
            setAsset(null);
            setFilePreview(null);
            toast.error(`Invalid file type. Please upload a ${assetType}.`);
        }
    };

    console.log(pdf);

    const handleInputFileChange = (e) => {
        const file = e.target.files[0];
        handleFileChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleAssetTypeChange = (e) => {
        setAssetType(e.target.value);
        setAsset(null);
        setFilePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!asset) {
            toast.error('Please select a file to upload.');
            return;
        }

        if (!name.trim()) {
            toast.error('Please enter a name for the asset.');
            return;
        }

        const loadingToast = toast.loading('Uploading file...');

        try {
            const formData = new FormData();
            formData.append('file', asset);
            formData.append('type', assetType);
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('email', userEmail);

            const response = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            dispatch(addSingleAsset(result.asset));

            toast.update(loadingToast, {
                render: 'File uploaded successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            setAsset(null);
            setFilePreview(null);
            setName('');
            setDescription('');
            e.target.reset();

        } catch (error) {
            console.error('Upload error:', error);
            toast.update(loadingToast, {
                render: error.message || 'Upload failed. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchFilter('all');
    };

    const filteredImages = filteredAssets.filter(asset => asset.type === 'image');
    const filteredPdfs = filteredAssets.filter(asset => asset.type === 'pdf');

    return (
        <div className='flex flex-col items-center justify-start w-full min-h-screen bg-light '>
            <ToastContainer />

            <div className="w-full mx-auto max-w-7xl">

                <div className="w-full border-b">
                    <div className="px-4 pt-3 pb-6 mx-auto max-w-7xl lg:py-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-black rounded-full shadow-lg">
                                <GalleryHorizontalIcon className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
                                    My Assets
                                </h1>
                                <p className="max-w-2xl text-base text-texts">
                                    Create, manage, and organize your digital assets. Upload images, PDFs, and more to access them anytime, anywhere.
                                </p>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span>{loadedAssets?.length || 0} Assets</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-around w-full max-w-[1500px] mx-auto px-4 py-8 gap-8">

                    <div className="bg-white w-full lg:w-[48%] rounded-3xl p-8 backdrop-blur-sm bg-white/90 border border-gray-100 shadow-lg">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-gradient-to-r from-black to-gray-900">
                                <UploadCloud className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800">Upload New Asset</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block mb-3 text-sm font-semibold text-gray-700">
                                    Asset Type
                                </label>
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setAssetType('image')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${assetType === 'image'
                                            ? 'border-hoverbg bg-purple/30 text-textPurple'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 mr-2" />
                                            Image
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAssetType('pdf')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${assetType === 'pdf'
                                            ? 'border-hoverbg bg-purple/30 text-textPurple'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center">
                                            <TextSelectionIcon className="w-5 h-5 mr-2" />
                                            PDF
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* File Upload Area */}
                            <div>
                                <label className="block mb-3 text-sm font-semibold text-gray-700">
                                    Upload File
                                </label>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${isDragOver
                                        ? 'border-hoverbg bg-purple/30'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <input
                                        type="file"
                                        accept={
                                            assetType === 'image' ? 'image/*'
                                                : assetType === 'pdf' ? 'application/pdf'
                                                    : ''
                                        }
                                        onChange={handleInputFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-hoverbg">
                                            <UploadCloud className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-gray-700">
                                                Drop your {assetType} here or <span className="text-textPurple">browse</span>
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {assetType === 'image' ? 'Supports: JPG, PNG, GIF, WebP' : 'Supports: PDF files only'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                                        Asset Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple focus:border-transparent"
                                        placeholder="Enter asset name"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hoverbg focus:border-transparent"
                                        placeholder="Brief description"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!asset}
                                className="w-full bg-hoverbg text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Upload Asset
                            </button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    {filePreview && (
                        <div className="bg-white rounded-2xl w-full h-full lg:w-[48%] shadow-xl p-8 backdrop-blur-sm bg-white/90 border border-white/20">
                            <div className="flex items-center mb-6">
                                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-black rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-800">Preview</h2>
                            </div>

                            <div className="overflow-hidden border border-gray-200 rounded-xl">
                                {assetType === 'image' ? (
                                    <img
                                        src={filePreview}
                                        alt="Asset Preview"
                                        className="object-contain w-full h-auto max-h-96 bg-gray-50"
                                    />
                                ) : (
                                    <iframe
                                        src={filePreview}
                                        title="Asset Preview"
                                        className="w-full h-96 bg-gray-50"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                
                {loadedAssets && loadedAssets.length > 0 && (
                    <div className="w-full px-4 mb-8">
                        <div className="p-6 bg-white border border-gray-100 shadow-lg rounded-2xl backdrop-blur-sm bg-white/90">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                                    <Search className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Search & Filter Assets</h3>
                            </div>

                            <div className="flex flex-col gap-4 md:flex-row">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <Search className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full py-3 pl-12 pr-4 transition-all duration-200 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <Filter className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <select
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        className="pl-12 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer min-w-[140px]"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="image">Images</option>
                                        <option value="pdf">PDFs</option>
                                    </select>
                                </div>

                                {(searchQuery || searchFilter !== 'all') && (
                                    <button
                                        onClick={clearSearch}
                                        className="flex items-center gap-2 px-6 py-3 font-medium text-gray-700 transition-all duration-200 bg-gray-100 hover:bg-gray-200 rounded-xl"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear
                                    </button>
                                )}
                            </div>

                            {(searchQuery || searchFilter !== 'all') && (
                                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        {filteredAssets.length} result{filteredAssets.length !== 1 ? 's' : ''} found
                                    </span>
                                    {searchQuery && (
                                        <span className="px-3 py-1 text-purple-700 bg-purple-100 rounded-full">
                                            "{searchQuery}"
                                        </span>
                                    )}
                                    {searchFilter !== 'all' && (
                                        <span className="px-3 py-1 text-blue-700 capitalize bg-blue-100 rounded-full">
                                            {searchFilter}s only
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="w-full mt-12 mb-32">
                    <div className="flex items-center mb-8">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 bg-black rounded-lg">
                            <SwatchBookIcon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Your Assets</h2>
                        {loadedAssets && loadedAssets.length > 0 && (
                            <span className="px-3 py-1 ml-4 text-sm font-medium text-black rounded-full bg-gray-200/60">
                                {searchQuery || searchFilter !== 'all' ? filteredAssets.length : loadedAssets.length} {((searchQuery || searchFilter !== 'all') ? filteredAssets.length : loadedAssets.length) === 1 ? 'asset' : 'assets'}
                            </span>
                        )}
                    </div>

                    {(searchQuery || searchFilter !== 'all' ? filteredImages : images).length > 0 ? (
                        <div className="w-full">
                            <h2 className="mb-6 text-2xl font-bold text-gray-800">Images</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {(searchQuery || searchFilter !== 'all' ? filteredImages : images).map((asset, index) => (
                                    <div key={index} className="w-full">
                                        <ImageCard asset={asset} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mb-4 text-gray-400">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-500">
                                {searchQuery || searchFilter !== 'all' ? 'No images match your search' : 'No images uploaded yet'}
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                                {searchQuery || searchFilter !== 'all' ? 'Try adjusting your search criteria' : 'Upload your first image to get started'}
                            </p>
                        </div>
                    )}

                    {(searchQuery || searchFilter !== 'all' ? filteredPdfs : pdf).length > 0 ? (
                        <div className="w-full mt-12">
                            <h2 className="mb-6 text-2xl font-bold text-gray-800">PDF Documents</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {(searchQuery || searchFilter !== 'all' ? filteredPdfs : pdf).map((asset, index) => (
                                    <div key={index} className="w-full">
                                        <PdfCard asset={asset} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 mt-8 text-center">
                            <div className="mb-4 text-gray-400">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-500">
                                {searchQuery || searchFilter !== 'all' ? 'No PDFs match your search' : 'No PDFs uploaded yet'}
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                                {searchQuery || searchFilter !== 'all' ? 'Try adjusting your search criteria' : 'Upload your first PDF document to get started'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default AssetUploadPage;