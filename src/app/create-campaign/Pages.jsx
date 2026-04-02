"use client"
import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { CrowdFundingContext } from '../../../Context/crowdfunding';
import { useRouter } from 'next/navigation';


// ── Step indicator component ───
const StepIndicator = ({current, total}) => (
    <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: total }).map((_, i) => (
            <React.Fragment key={i}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                    i < current
                        ? "bg-accent text-white"
                        : i === current
                        ? "bg-primary text-white"
                        : "bg-secondary text-muted-foreground border border-border"
                }`}>
                    {i < current
                        ? <Icon icon="solar:check-circle-bold" className="size-4"/>
                        : i + 1
                    }
                </div>
                {i < total - 1 && (
                    <div className={`flex-1 h-0.5 transition-all duration-500 ${
                        i < current ? "bg-accent" : "bg-border"
                    }`}/>
                )}
            </React.Fragment>
        ))}
    </div>
);

// ── Input component ───

const FormInput = ({ label, icon, error, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
            {label}
        </label>
        <div className="relative">
            {icon && (
                <Icon
                    icon={icon}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                />
            )}
            <input 
                className={`w-full rounded-lg border bg-secondary text-foreground placeholder:text-muted-foreground
                        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                        transition-all duration-200 py-2.5
                        ${icon ? "pl-10 pr-4" : "px-4"}
                        ${error ? "border-destructive" : "border-border"}
                    `}
                    {...props}            
            />
        </div>
        {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
                <Icon icon="solar:danger-circle-bold" className="size-3" />
                {error}
            </p>
        )}
    </div>
)

// ── Textarea component ───
const FormTextarea = ({ label, error, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <textarea
            className={`w-full rounded-lg border bg-secondary text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                transition-all duration-200 px-4 py-2.5 resize-none
                ${error ? "border-destructive" : "border-border"}
            `}
            rows={4}
            {...props}
        />
        {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
                <Icon icon="solar:danger-circle-bold" className="size-3" />
                {error}
            </p>
        )}
    </div>
)

// ── Main Page ────
const CreateCampaignPage = () => {
    const router = useRouter();
    const { createCampaign, currentAccount } = useContext(CrowdFundingContext);

    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // ── Form state ────
    const [form, setForm] = useState({
        title: "",
        description: "",
        target: "",
        deadline: "",
    });

    const [milestones, setMilestones] = useState([
        { description: "", amount: "" },
    ]);

    // ── Handlers ─────
    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value}));
        if (errors[field]) setErrors(prev => ({...prev, [field]: "" }));
    };

    const updateMilestone = (index, field, value) => {
        setMilestones(prev =>
            prev.map((m, i) => i === index ? { ...m, [field]: value} : m)
        );
        if (errors[`milestone_${index}_${field}`]) {
            setErrors(prev => ({ ...prev, [`milestone_${index}_${field}`]: "" }));
        }
    };

    const addMilestone = () => {
        setMilestones(prev => [...prev, { description: "", amount: "" }]);
    };

    const removeMilestone = (index) => {
        if (milestones.length === 1) return; // always keep at least one
        setMilestones(prev => prev.filter((_, i) => i !== index));
    };

    // ── Validation ────
    const validateStep0 = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.description.trim()) newErrors.description = "Description is required";
        if (!form.target || isNaN(form.target) || Number(form.target) <= 0)
            newErrors.target = "Enter a valid target amount in ETH";
        if (!form.deadline) {
            newErrors.deadline = "Deadline is required";
    } else if (new Date(form.deadline).getTime() <= Date.now()) {
            newErrors.deadline = "Deadline must be in the future";
        }
        setErrors(newErrors);
        return Object.keys(newErrors),length === 0;
    }
  return (
    <div>Pages</div>
  )
}

export default CreateCampaignPage