export interface GuideSectionMeta {
  id: string;
  /** Two-digit label rendered in the section badge and the table of contents. */
  number: string;
  title: string;
}

export const ARMY_NET_SECTIONS: GuideSectionMeta[] = [
  { id: "lab-variables", number: "01", title: "Lab variables" },
  { id: "topology", number: "02", title: "Topology and ports" },
  { id: "switch", number: "03", title: "Switch configuration" },
  { id: "router", number: "04", title: "Router configuration" },
  { id: "dns", number: "05", title: "DNS configuration" },
  { id: "dhcp", number: "06", title: "DHCP configuration" },
  { id: "ou-structure", number: "07", title: "OU structure" },
  { id: "user-naming", number: "08", title: "User naming standards" },
  { id: "user-properties", number: "09", title: "User properties" },
  { id: "verification", number: "10", title: "Verification checklist" },
];

export interface QuickFact {
  label: string;
  value: string;
}

export const ARMY_NET_FACTS: QuickFact[] = [
  { label: "Domain", value: "ArmyNet.mil" },
  { label: "DC / DNS", value: "10.0.0.10" },
  { label: "DHCP network", value: "192.100.X.0/24" },
  { label: "Management VLAN", value: "99" },
];

export interface LabVariable {
  symbol: string;
  meaning: string;
}

export const LAB_VARIABLES: LabVariable[] = [
  { symbol: "X", meaning: "Your station number" },
  { symbol: "XX", meaning: "Assigned data VLAN number" },
  { symbol: "VLAN 99", meaning: "Management VLAN" },
  {
    symbol: "VLAN 999",
    meaning: "Additional/unused VLAN used in the lab",
  },
  { symbol: "DC", meaning: "Domain Controller" },
  { symbol: "DC/DNS IP", meaning: "10.0.0.10" },
  { symbol: "Domain", meaning: "ArmyNet.mil" },
  { symbol: "DHCP network", meaning: "192.100.X.0/24" },
  { symbol: "Management switch IP", meaning: "192.99.X.2/24" },
];

export const CONFIG_ORDER: string[] = [
  "Connect and identify interfaces.",
  "Configure the switch.",
  "Configure the router.",
  "Configure DNS.",
  "Configure DHCP.",
  "Build the OUs.",
  "Create and configure users.",
  "Set the laptop to DHCP.",
  "Add the computer to the domain.",
];

export interface ChecklistGroup {
  id: string;
  title: string;
  items: string[];
}

export const VERIFICATION_GROUPS: ChecklistGroup[] = [
  {
    id: "switch",
    title: "Switch",
    items: [
      "Access ports are assigned to the correct VLAN.",
      "Unused ports are shut down.",
      "Port security is configured.",
      "The trunk allows VLANs XX and 99.",
      "The management SVI has the correct IP.",
      "The default gateway is configured.",
      "SSH and housekeeping commands are present.",
    ],
  },
  {
    id: "router",
    title: "Router",
    items: [
      "Data and management subinterfaces exist.",
      "Each subinterface uses the correct dot1Q VLAN.",
      "ip helper-address points to 10.0.0.10.",
      "The physical interface is not shut down.",
      "OSPF advertises all required networks.",
      "User-facing VLAN interfaces are passive.",
    ],
  },
  {
    id: "server",
    title: "Server",
    items: [
      "The secondary DNS zone exists.",
      "Zone transfers are allowed.",
      "DHCP is authorized.",
      "The DHCP scope is active.",
      "Exclusions protect static addresses.",
      "Gateway, DNS, and WINS options are correct.",
    ],
  },
  {
    id: "active-directory",
    title: "Active Directory",
    items: [
      "The OU hierarchy is correct.",
      "Users are placed in the correct S1 or S6 OU/group.",
      "Names follow the required format.",
      "General and Address tabs are complete.",
      "The account expiration matches the authorized source paperwork.",
    ],
  },
  {
    id: "client",
    title: "Client computer",
    items: [
      "The laptop is set to DHCP.",
      "It receives an address from 192.100.X.0/24.",
      "It receives the correct default gateway and DNS server.",
      "It can reach the gateway and Domain Controller.",
      "It can resolve the ArmyNet.mil domain.",
      "It is added to the domain only after the network, DNS, and DHCP configurations are working.",
    ],
  },
];

export const VERIFICATION_TOTAL = VERIFICATION_GROUPS.reduce(
  (total, group) => total + group.items.length,
  0
);
