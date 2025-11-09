'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { isAdminAuthenticated, adminLogout } from '@/app/actions/admin-auth'
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  type Company,
} from '@/app/actions/admin-companies'
import { uploadCompanyLogo } from '@/app/actions/upload-logo'
import { getAllIndustries, type Industry } from '@/app/actions/admin-industries'
import { Plus, Pencil, Trash2, X, LogOut, Upload, Search } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [error, setError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false)
  const [total, setTotal] = useState(0)
  const [isInitialMount, setIsInitialMount] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    logoUrl: '',
    industryId: '',
    headquarters: '',
    founded: '',
    companyType: '',
    description: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      router.push('/admin')
      return
    }
    await loadCompanies(true, true) // Initial load
    await loadIndustries()
    setIsInitialMount(false)
  }

  const loadIndustries = async () => {
    const result = await getAllIndustries()
    if (result.success && result.data) {
      setIndustries(result.data)
    }
  }

  const loadCompanies = async (reset: boolean = false, isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setLoading(true)
    } else if (reset) {
      setSearching(true)
      setOffset(0)
    } else {
      setLoadingMore(true)
    }

    const currentOffset = reset ? 0 : offset

    const result = await getAllCompanies(searchQuery, currentOffset, 20)

    if (result.success && result.data) {
      if (reset || isInitialLoad) {
        setCompanies(result.data)
      } else {
        setCompanies((prev) => [...prev, ...result.data!])
      }
      setTotal(result.total || 0)
      setHasMore(result.data.length === 20)
      setOffset(currentOffset + result.data.length)
    } else {
      setError(result.error || 'Failed to load companies')
      console.error('Failed to load companies:', result.error)
    }

    setLoading(false)
    setLoadingMore(false)
    setSearching(false)
  }

  // Handle search with debounce
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount) return

    const timeoutId = setTimeout(() => {
      loadCompanies(true, false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadCompanies(false)
        }
      },
      { threshold: 0.1 }
    )

    const target = document.getElementById('observer-target')
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [hasMore, loadingMore, loading, offset])

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin')
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      slug: '',
      website: '',
      logoUrl: '',
      industryId: '',
      headquarters: '',
      founded: '',
      companyType: '',
      description: '',
    })
    setEditingCompany(null)
    setLogoFile(null)
    setLogoPreview('')
    setShowCreateModal(true)
    setError('')
  }

  const openEditModal = (company: Company) => {
    setFormData({
      name: company.name,
      slug: company.slug,
      website: company.website || '',
      logoUrl: company.logoUrl || '',
      industryId: company.industryId?.toString() || '',
      headquarters: company.headquarters || '',
      founded: company.founded?.toString() || '',
      companyType: company.companyType || '',
      description: company.description || '',
    })
    setEditingCompany(company)
    setLogoFile(null)
    setLogoPreview(company.logoUrl || '')
    setShowCreateModal(true)
    setError('')
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingCompany(null)
    setLogoFile(null)
    setLogoPreview('')
    setError('')
  }

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    let logoUrl = formData.logoUrl

    // If a file is selected, upload it first
    if (logoFile) {
      setUploadingLogo(true)
      const uploadResult = await uploadCompanyLogo(logoFile)
      setUploadingLogo(false)

      if (uploadResult.success && uploadResult.url) {
        logoUrl = uploadResult.url
      } else {
        setError(uploadResult.error || 'Failed to upload logo')
        return
      }
    }

    const companyData = {
      name: formData.name,
      slug: formData.slug,
      website: formData.website || null,
      logoUrl: logoUrl || null,
      industryId: formData.industryId ? parseInt(formData.industryId) : null,
      headquarters: formData.headquarters || null,
      founded: formData.founded ? parseInt(formData.founded) : null,
      companyType: formData.companyType || null,
      description: formData.description || null,
    }

    if (editingCompany) {
      // Update
      const result = await updateCompany({
        companyId: editingCompany.companyId,
        ...companyData,
      })

      if (result.success) {
        await loadCompanies(true)
        closeModal()
      } else {
        setError(result.error || 'Failed to update company')
      }
    } else {
      // Create
      const result = await createCompany(companyData)

      if (result.success) {
        await loadCompanies(true)
        closeModal()
      } else {
        setError(result.error || 'Failed to create company')
      }
    }
  }

  const handleDelete = async (companyId: number, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"?`)) {
      return
    }

    const result = await deleteCompany(companyId)

    if (result.success) {
      await loadCompanies(true)
    } else {
      alert(result.error || 'Failed to delete company')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/transpayra_main.png"
                  alt="Transpayra"
                  width={200}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
              <span className="text-sm text-gray-500">Admin Dashboard</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-secondary bg-white border border-gray-300 rounded-lg hover:bg-brand-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage company database ({total} total)
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name, slug, industry, or headquarters..."
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-secondary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Headquarters
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No companies found. Add your first company to get started.
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.companyId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.companyId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={`${company.name} logo`}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                            No logo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.industryName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.headquarters || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(company)}
                            className="inline-flex items-center px-3 py-1.5 text-white bg-brand-secondary hover:bg-brand-accent border border-brand-secondary rounded-md transition-colors font-medium"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(company.companyId, company.name)}
                            className="inline-flex items-center px-3 py-1.5 text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-md transition-colors font-medium"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Infinite Scroll Loading Indicator */}
          {loadingMore && (
            <div className="px-6 py-4 text-center text-sm text-gray-500">
              Loading more companies...
            </div>
          )}

          {/* Observer Target for Infinite Scroll */}
          {hasMore && !loading && (
            <div id="observer-target" className="h-4"></div>
          )}

          {/* End of List Message */}
          {!hasMore && companies.length > 0 && (
            <div className="px-6 py-4 text-center text-sm text-gray-500">
              No more companies to load
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                    placeholder="Leave empty to auto-generate from name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly identifier (e.g., &quot;google&quot;, &quot;meta&quot;)
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>

                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={80}
                        height={80}
                        className="h-20 w-20 object-contain border border-gray-200 rounded-lg p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreview('')
                          setFormData({ ...formData, logoUrl: '' })
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="mb-3">
                    <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-secondary transition-colors">
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {logoFile ? logoFile.name : 'Click to upload logo'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WebP, or SVG (max 2MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* OR divider */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-xs text-gray-500 uppercase">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  {/* Logo URL Input */}
                  <div>
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, logoUrl: e.target.value })
                        if (e.target.value) {
                          setLogoFile(null)
                          setLogoPreview(e.target.value)
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                      placeholder="Paste logo URL here"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a direct URL to a logo image
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={formData.industryId}
                    onChange={(e) => setFormData({ ...formData, industryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                  >
                    <option value="">Select an industry (optional)</option>
                    {industries.map((ind) => (
                      <option key={ind.industryId} value={ind.industryId}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={formData.headquarters}
                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                    placeholder="2004"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Type
                  </label>
                  <input
                    type="text"
                    value={formData.companyType}
                    onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                    placeholder="Public, Private, Startup"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-gray-900"
                    rows={3}
                    placeholder="Brief description of the company"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="flex-1 px-6 py-3 bg-brand-secondary text-white rounded-lg font-medium hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingLogo
                    ? 'Uploading logo...'
                    : editingCompany
                    ? 'Update Company'
                    : 'Create Company'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploadingLogo}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
