import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useWells from '../hooks/useWells.js';
import { getWellById } from '../services/wellStorageService.js';
import WellSetupSection from './WellSetupSection.jsx';
import RigSetupSection from './RigSetupSection.jsx';
import { WELL_STATUS } from '../constants.js';

/**
 * Well create/edit form component.
 * In create mode (/wells/create): all fields empty, both sections expanded, 'Create Well' submit button.
 * In edit mode (/wells/:id/edit): loads well data from localStorage via wellStorageService,
 * Rig Setup collapsed, Well Setup expanded, all fields pre-populated, 'Update Well' submit button.
 * Cancel button returns to well list. On submit, calls createWell or updateWell and navigates back to grid.
 * Validates required fields before submission.
 *
 * @returns {JSX.Element}
 */
function WellForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { createWell, updateWell } = useWells();

  const [formData, setFormData] = useState({
    name: '',
    wellId: '',
    spudDate: '',
    operator: '',
    status: WELL_STATUS.CREATED,
    rig: '',
    contractor: '',
    type: '',
    location: '',
    owner: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wellSetupCollapsed, setWellSetupCollapsed] = useState(false);
  const [rigSetupCollapsed, setRigSetupCollapsed] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode && id) {
      const well = getWellById(id);
      if (well) {
        setFormData({
          name: well.name || '',
          wellId: well.id || '',
          spudDate: well.spudDate || '',
          operator: well.operator || '',
          status: well.status || WELL_STATUS.CREATED,
          rig: well.rig || '',
          contractor: well.contractor || '',
          type: well.type || '',
          location: well.location || '',
          owner: well.owner || '',
        });
      } else {
        setSubmitError(`Well with ID "${id}" not found.`);
      }
    }
  }, [isEditMode, id]);

  /**
   * Handles field changes from child section components.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value.
   */
  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  /**
   * Validates the form data and returns an errors object.
   * @returns {Record<string, string>} Validation errors keyed by field name.
   */
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Well Name is required.';
    }

    if (!formData.spudDate || formData.spudDate.trim() === '') {
      newErrors.spudDate = 'Spud Date is required.';
    } else {
      const date = new Date(formData.spudDate);
      if (isNaN(date.getTime())) {
        newErrors.spudDate = 'Spud Date must be a valid date.';
      }
    }

    if (!formData.operator || formData.operator.trim() === '') {
      newErrors.operator = 'Operator is required.';
    }

    if (!formData.rig || formData.rig.trim() === '') {
      newErrors.rig = 'Rig Name is required.';
    }

    if (!formData.contractor || formData.contractor.trim() === '') {
      newErrors.contractor = 'Contractor is required.';
    }

    return newErrors;
  }, [formData]);

  /**
   * Handles form submission for create or update.
   * @param {React.FormEvent} e
   */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setSubmitError(null);

      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);

        const hasRigErrors = validationErrors.rig || validationErrors.contractor;
        const hasWellErrors = validationErrors.name || validationErrors.spudDate || validationErrors.operator || validationErrors.status;

        if (hasWellErrors) {
          setWellSetupCollapsed(false);
        }
        if (hasRigErrors) {
          setRigSetupCollapsed(false);
        }

        return;
      }

      setLoading(true);

      try {
        if (isEditMode) {
          const updates = {
            name: formData.name,
            spudDate: formData.spudDate,
            operator: formData.operator,
            status: formData.status,
            rig: formData.rig,
            contractor: formData.contractor,
            type: formData.type || 'Horizontal',
            location: formData.location || 'Unknown',
            owner: formData.owner || formData.operator,
          };

          const result = updateWell(id, updates);
          if (!result.success) {
            setSubmitError(result.error || 'Failed to update well.');
            setLoading(false);
            return;
          }
        } else {
          const wellData = {
            name: formData.name,
            spudDate: formData.spudDate,
            operator: formData.operator,
            status: formData.status,
            rig: formData.rig,
            contractor: formData.contractor,
            type: formData.type || 'Horizontal',
            location: formData.location || 'Unknown',
            owner: formData.owner || formData.operator,
          };

          const result = createWell(wellData);
          if (!result.success) {
            setSubmitError(result.error || 'Failed to create well.');
            setLoading(false);
            return;
          }
        }

        navigate('/');
      } catch (err) {
        setSubmitError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    },
    [validate, isEditMode, formData, id, createWell, updateWell, navigate]
  );

  /**
   * Handles cancel button click, navigates back to the well list.
   */
  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toggleWellSetup = useCallback(() => {
    setWellSetupCollapsed((prev) => !prev);
  }, []);

  const toggleRigSetup = useCallback(() => {
    setRigSetupCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">
          {isEditMode ? 'Edit Well' : 'Create New Well'}
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          {isEditMode
            ? 'Update the well details below and save your changes.'
            : 'Fill in the details below to create a new well.'}
        </p>
      </div>

      {/* Submit Error Banner */}
      {submitError && (
        <div className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Well Setup Section */}
          <WellSetupSection
            isCollapsed={wellSetupCollapsed}
            onToggle={toggleWellSetup}
            wellName={formData.name}
            wellId={isEditMode ? formData.wellId : formData.wellId}
            spudDate={formData.spudDate}
            operator={formData.operator}
            status={formData.status}
            onFieldChange={handleFieldChange}
            errors={errors}
            disabled={loading}
            isEditMode={isEditMode}
          />

          {/* Rig Setup Section */}
          <RigSetupSection
            isCollapsed={rigSetupCollapsed}
            onToggle={toggleRigSetup}
            rigName={formData.rig}
            contractor={formData.contractor}
            onFieldChange={handleFieldChange}
            errors={errors}
            disabled={loading}
          />
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-dark-border pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
                ? 'Update Well'
                : 'Create Well'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default WellForm;