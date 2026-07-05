"use client"
import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { CrowdFundingContext } from '../../../Context/crowdfunding';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';


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
        return Object.keys(newErrors).length === 0;
    }

    const validateStep1 = () => {
        const newErrors = {};
        let totalMilestoneAmount = 0;

        milestones.forEach((m, i) => {
             if (!m.description.trim()) 
                    newErrors[`milestone_${i}_description`] = "Description is required";

                // Hardened amount check — catches empty, non-numeric, zero, and negative
                const amt = Number(m.amount);
             if (!m.amount || m.amount.toString().trim() === "" || isNaN(amt) || amt <= 0) {
                 newErrors[`milestone_${i}_amount`] = "Enter a valid amount";
             }
             else {
            totalMilestoneAmount += amt;
        }
    })

    const target = Number(form.target)
    // Round to avoid floating point issues like 0.1 + 0.2 = 0.30000000000004
    const totalRounded = Math.round(totalMilestoneAmount * 1e8) / 1e8;
    const targetRounded = Math.round(target * 1e8) / 1e8;

    console.log("Milestone total:", totalRounded, "Target:", targetRounded);

    if(totalRounded > targetRounded) {
        newErrors.milestonesTotal = `Total milestone amounts (${totalRounded} ETH) cannot be greater than campaign target (${targetRounded} ETH)`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    }

    const handleNext = () => {
        if(step === 0 && validateStep0()) setStep(1);
        else if (step === 1 && validateStep1()) setStep(2);
    }

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if(!currentAccount) {
            // To be changed to a toaster notification
            alert("Please connect your wallet first");
            return;
        } 
        try {
            setIsLoading(true);
            await createCampaign({
                title: form.title,
                description: form.description,
                target: form.target,
                deadline: form.deadline,
                milestoneDescriptions: milestones.map(m => m.description),
                milestoneAmounts: milestones.map(m => m.amount),
            });
            router.push("/");
        } catch(err){
            console.log("Error creating campaign:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Total milestone ETH ───
    const totalMilestoneETH = milestones
        .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0)
        .toFixed(4);

    const remainingETH = (
        (parseFloat(form.target) || 0) - parseFloat(totalMilestoneETH)
    ).toFixed(4);

  return (
    <div className='min-h-screen bg-background pt-24 pb-20'>
        <div className="container mx-auto px-4 max-w-2xl">
            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 text-center" 
            >
                <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
                    <Icon icon="solar:rocket-bold" className="size-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Launch a Campaign
                        </span>
                </div>
                <h1 className="font-heading text-4xl font-semibold tracking-tight mb-3">
                        Create Your Campaign
                </h1>
                <p className="text-muted-foreground text-lg">
                        Set your funding goal, define milestones, and let your backers govern fund release.
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="rounded-2xl border border-border bg-card p-8"
                >
                    <StepIndicator current={step} total={3} />

                    {/* Step 0: Campaign details */}
                    <AnimatePresence mode='wait'>
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-5"
                            >
                               <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="solar:document-bold" className="size-5 text-primary" />
                                    <h2 className="text-xl font-semibold">Campaign Details</h2>
                                </div> 

                                <FormInput
                                    label="Campaign Title"
                                    icon="solar:pen-bold"
                                    placeholder="e.g. Open Source DeFi Toolkit"
                                    value={form.title}
                                    onChange={e => updateForm("title", e.target.value)}
                                    error={errors.title}
                                />

                                <FormTextarea
                                    label="Description"
                                    placeholder="Describe your project, what you are building, and why it matters"
                                    value={form.description}
                                    onChange={e => updateForm("description", e.target.value)}
                                    error={errors.description}
                                />

                                <FormInput
                                    label="Funding Target (ETH)"
                                    icon="solar:dollar-minimalistic-bold"
                                    placeholder="e.g. 5.0"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.target}
                                    onChange={e => updateForm("target", e.target.value)}
                                    error={errors.target}
                                />

                                <FormInput
                                    label="Campaign Deadline"
                                    icon="solar:calender-bold"
                                    type="datetime-local"
                                    min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)} 
                                    value={form.deadline}
                                    onChange={e => updateForm("deadline", e.target.value)}
                                    error={errors.deadline}
                                />
                            </motion.div>

                        )}
                        {/* Step 1: Milestones */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-5"
                            >
                               <div className="flex items-center justify-between mb-2">
                                   <div className="flex items-center gap-2">
                                        <Icon icon="solar:flag-bold" className="size-5 text-primary" />
                                        <h2 className="text-xl font-semibold">Milestones</h2>
                                    </div>
                                     <Badge className="bg-primary/10 text-primary border-primary/20">
                                        Target: {form.target} ETH
                                    </Badge>
                                </div> 

                                <p className="text-sm text-muted-foreground -mt-2">
                                    Funds are released per milestone only after donor approval. Total amounts must not exceed your target.
                                </p>

                                {/* Milestone List */}
                                <div className="flex flex-col gap-4">
                                    <AnimatePresence>
                                        {milestones.map((milestone, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="rounded-xl border border-border bg-secondary/50 p-4 flex flex-col gap-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                            <span className="text-xs font-bold text-primary">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                            <span className="text-sm font-medium text-foreground">
                                                                Milestone {index + 1}
                                                            </span>
                                                    </div>
                                                    {milestones.length > 1 && (
                                                        <button 
                                                            onClick={() => removeMilestone(index)}
                                                            className="text-muted-foreground hover:text-destructive transition-colors">
                                                            <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                                                        </button>
                                                    )}
                                                </div>

                                               <FormInput
                                                    label="Description"
                                                    placeholder="e.g. Smart contract deployed and audited"
                                                    value={milestone.description}
                                                    onChange={e => updateMilestone(index, "description", e.target.value)}
                                                    error={errors[`milestone_${index}_description`]}
                                                />

                                                <FormInput
                                                    label="Amount (ETH)"
                                                    icon="fa6-brands:ethereum"
                                                    placeholder="e.g. 1.5"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={milestone.amount}
                                                    onChange={e => updateMilestone(index, "amount", e.target.value)}
                                                    error={errors[`milestone_${index}_amount`]}
                                                />  
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Add milestone button */}
                                 <button
                                    onClick={addMilestone}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-sm text-primary hover:bg-primary/5 transition-colors"
                                >
                                    <Icon icon="solar:add-circle-bold" className="size-4" />
                                    Add Milestone
                                </button>
                                {/* Running total */}
                                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Total allocated</span>
                                            <span className={`font-semibold ${
                                                parseFloat(totalMilestoneETH) > parseFloat(form.target)
                                                    ? "text-destructive"
                                                    : "text-accent"
                                            }`}>
                                            {totalMilestoneETH} ETH
                                        </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Remaining</span>
                                            <span className={`font-semibold ${
                                                parseFloat(remainingETH) < 0
                                                    ? "text-destructive"
                                                    : "text-foreground"
                                            }`}>
                                                    {remainingETH} ETH
                                            </span>
                                    </div>
                                    {errors.milestonesTotal && (
                                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                                            <Icon icon="solar:danger-circle-bold" className="size-3" />
                                            {errors.milestonesTotal}
                                        </p>
                                    )}
                                </div>
                            </motion.div>    
                        )}
                         {/* ── STEP 2: Review ─────  */}
                         {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-5"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="solar:eye-bold" className="size-5 text-primary" />
                                    <h2 className="text-xl font-semibold">Review & Launch</h2>
                                </div>

                                {/* Campaign summary */}
                                <div className="rounded-xl border border-border bg-secondary/50 p-5 flex flex-col gap-3">l
                                    <h3 className="font-semibold text-lg">
                                        {form.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {form.description}
                                    </p>
                                    <div className="flex flex-wrap gap-3 pt-1">
                                       <div className="flex items-center gap-1.5 text-sm">
                                            <Icon icon="solar:dollar-minimalistic-bold" className="size-4 text-primary" />
                                            <span className="text-muted-foreground">Target:</span>
                                            <span className="font-semibold text-foreground">{form.target} ETH</span>
                                        </div>
                                        <div className="flex items-center gap-1 5 text-sm">
                                            <Icon icon="solar:calendar-bold" className="size-4 text-primary" />
                                            <span className="text-muted-foreground">Deadline:</span>
                                            <span className="font-semibold text-foreground">
                                                {new Date(form.deadline).toLocaleDateString()}
                                            </span>
                                        </div> 
                                    </div>
                                </div>

                                {/* Milestones summary */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium text-foreground">
                                        {milestones.length} Milestone{milestones.length > 1 ? "s" : ""}
                                    </p>
                                    {milestones.map((m, i) => (
                                        <div 
                                            key={i}
                                            className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                                                </div>
                                                <span className="text-sm text-foreground">{m.description}</span>
                                            </div>
                                             <Badge className="bg-accent/10 text-accent border-accent/20">
                                                {m.amount} ETH
                                            </Badge>  
                                        </div>
                                    ))}
                                </div>

                                {/* Wallet warning if not connected */}
                                {!currentAccount && (
                                    <div className="flex items-center gap-3 rounded-xl border border-desctructive/30 bg-destructive/10 px-4 py-3">
                                        <Icon icon="solar:danger-triangle-bold" className="size-5 text-destructive shrink-0" />
                                        <p className="text-sm text-destructive">
                                            Please connect your wallet before launching your campaign.
                                        </p>
                                    </div>
                                )}

                                {/* Gas note */}
                                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                                    <Icon icon="solar:info-circle-bold" className="size-5 text-primary shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                        Launching requires a blockchain transaction. MetaMask, Rabby or any wallet provider of your choice will prompt you to approve and pay the gas fee.
                                    </p>
                                </div>
                            </motion.div>
                         )}
                    </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                   <Button 
                    className="gap-2"
                    variant='outline'
                    onClick={handleBack}
                    disabled={step === 0}
                    >
                        <Icon icon="solar:arrow-left-bold" className="size-4" />
                            Back
                    </Button> 

                    {step < 2 ? (
                       <Button
                            onClick={handleNext}
                            className="gap-2 bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20"
                            >
                                Next
                                <Icon icon="solar:arrow-right-bold" className="size-4" />
                            </Button> 
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !currentAccount}
                            className="gap-2 bg-gradient-to-br from-accent/90 shadow-accent/20">
                                {isLoading ? (
                                    <>
                                    <Icon icon="solar:refresh-bold" className="size-4 animate-spin" />
                                        Launching...
                                    </>
                                ) : (
                                    <>
                                    <Icon icon="solar:rocket-bold" className="size-4" />
                                        Launch Campaign
                                    </>
                                )}
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    </div>
  )
}

export default CreateCampaignPage