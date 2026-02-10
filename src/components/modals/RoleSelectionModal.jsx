import React from 'react';
import { Briefcase, Building, X, ArrowRight, Check } from 'lucide-react';
import './RoleSelectionModal.css';

function RoleSelectionModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={() => onClose()}>
            <div className="modal-content role-selection-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Continue as...</h2>
                    <p>Select your account type to continue with Google</p>
                    <button className="close-btn" onClick={() => onClose()}>
                        <X size={20} />
                    </button>
                </div>

                <div className="role-options">
                    <div className="role-card" onClick={() => onSelect('client')}>
                        <div className="role-icon client">
                            <Building size={32} />
                        </div>
                        <div className="role-info">
                            <h3>I want to Hire</h3>
                            <p>Post jobs and find the best freelancers</p>
                        </div>
                        <div className="role-action">
                            <ArrowRight size={20} />
                        </div>
                    </div>

                    <div className="role-card" onClick={() => onSelect('freelancer')}>
                        <div className="role-icon freelancer">
                            <Briefcase size={32} />
                        </div>
                        <div className="role-info">
                            <h3>I want to Work</h3>
                            <p>Find projects and grow your career</p>
                        </div>
                        <div className="role-action">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <p>You can't change this later without contacting support.</p>
                </div>
            </div>
        </div>
    );
}

export default RoleSelectionModal;
