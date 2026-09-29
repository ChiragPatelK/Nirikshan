import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = {
  MP: {
    id: 'MP',
    name: 'Members of Parliament',
    shortName: 'Hon\'ble MP',
    badge: 'Member of Parliament',
    badgeColor: '#0284c7', // Sky Blue
    authorityTitle: 'Hon\'ble MP · Dharwad Constituency',
    jurisdictionType: 'constituency',
    defaultState: 'Karnataka',
    defaultDistrict: 'Dharwad',
    defaultConstituency: 'Dharwad',
    defaultMPId: 'MP001',
    defaultMPName: 'Pralhad Venkatesh Joshi',
    actionLabel: 'Recommend Work',
    actionType: 'RECOMMEND',
    description: 'Constituency recommendation, entitlement allocation & public delivery tracking',
  },
  STATE: {
    id: 'STATE',
    name: 'State Nodal Authorities',
    shortName: 'State Nodal (SNA)',
    badge: 'State Nodal Authority (SNA)',
    badgeColor: '#10b981', // Emerald Green
    authorityTitle: 'Planning & Programme Implementation Dept',
    jurisdictionType: 'state',
    defaultState: 'Karnataka',
    actionLabel: 'State Review & Escalate',
    actionType: 'ESCALATE',
    description: 'State-wide progress monitoring, inter-district review & bottleneck escalation',
  },
  DISTRICT: {
    id: 'DISTRICT',
    name: 'District Authorities',
    shortName: 'District Authority (DA)',
    badge: 'District Authority (IDA)',
    badgeColor: '#d97706', // Amber
    authorityTitle: 'Office of Deputy Commissioner / District Magistrate',
    jurisdictionType: 'district',
    defaultState: 'Karnataka',
    defaultDistrict: 'Dharwad',
    actionLabel: 'Field Inspection & Sanction',
    actionType: 'INSPECT',
    description: 'District Collector scrutiny, milestone verification, geotagging & sanctions',
  },
  MINISTRY: {
    id: 'MINISTRY',
    name: 'The Ministry',
    shortName: 'The Ministry (MoSPI)',
    badge: 'National MoSPI Oversight',
    badgeColor: '#4f46e5', // Indigo
    authorityTitle: 'Ministry of Statistics & Programme Implementation',
    jurisdictionType: 'national',
    actionLabel: 'Forensic Audit & Freeze',
    actionType: 'FREEZE',
    description: 'Central policy, national AI risk surveillance, compliance auditing & fund freezes',
  },
};

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('nirikshan-role') || 'MINISTRY';
    } catch (_) {
      return 'MINISTRY';
    }
  });

  const [roleState, setRoleState] = useState('Karnataka');
  const [roleDistrict, setRoleDistrict] = useState('Dharwad');
  const [roleMPId, setRoleMPId] = useState('MP001');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'RECOMMEND',
    targetWork: null,
  });

  const updateRole = (newRole) => {
    if (ROLES[newRole]) {
      setRole(newRole);
      try {
        localStorage.setItem('nirikshan-role', newRole);
      } catch (_) {}
    }
  };

  const openActionModal = (type, targetWork = null) => {
    setActionModal({
      isOpen: true,
      type: type || ROLES[role]?.actionType || 'RECOMMEND',
      targetWork,
    });
  };

  const closeActionModal = () => {
    setActionModal({
      isOpen: false,
      type: 'RECOMMEND',
      targetWork: null,
    });
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        roleConfig: ROLES[role] || ROLES.MINISTRY,
        setRole: updateRole,
        roleState,
        setRoleState,
        roleDistrict,
        setRoleDistrict,
        roleMPId,
        setRoleMPId,
        actionModal,
        openActionModal,
        closeActionModal,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return ctx;
}
