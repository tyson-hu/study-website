import { CommandBlock } from "@/components/army-net/command-block"
import {
  Bullets,
  Callout,
  FieldTable,
  GuideSection,
  GuideText,
  Mono,
  Steps,
  Subsection,
} from "@/components/army-net/guide-parts"
import { VerificationChecklist } from "@/components/army-net/verification-checklist"
import { CONFIG_ORDER, LAB_VARIABLES } from "@/lib/army-net"

const TOPOLOGY = `Laptop ─── Switch ═══ Router ─── Instructor/Upstream Network
           Access     Trunk`

const OU_TREE = `TrainingOrg
├── Users
│   ├── S1
│   └── S6
└── Computers
    ├── S1
    └── S6`

export function GuideContent() {
  return (
    <div className="min-w-0 space-y-6">
      <GuideSection
        id="lab-variables"
        number="01"
        title="Lab variables"
        summary="Values shown as <blank> must come from your station's addressing plan, SAAR, or instructor."
      >
        <FieldTable
          columns={["Symbol", "Meaning"]}
          rows={LAB_VARIABLES.map((variable) => [
            variable.symbol,
            variable.meaning,
          ])}
        />
      </GuideSection>

      <GuideSection
        id="topology"
        number="02"
        title="Physical topology and port assignments"
      >
        <CommandBlock code={TOPOLOGY} caption="topology" copyable={false} />

        <Subsection title="Port assignments">
          <Bullets
            items={[
              <>
                <strong className="font-medium text-foreground">
                  Port/group 6:
                </strong>{" "}
                all switch ports except the trunk and laptop port
              </>,
              <>
                <strong className="font-medium text-foreground">Port 5:</strong>{" "}
                laptop-to-switch access port
              </>,
              <>
                <strong className="font-medium text-foreground">Port 2:</strong>{" "}
                switch-to-router trunk port
              </>,
              "The switch-facing router interface uses subinterfaces for the data and management VLANs.",
            ]}
          />
        </Subsection>

        <Subsection title="Recommended configuration order">
          <Steps items={CONFIG_ORDER} />
        </Subsection>
      </GuideSection>

      <GuideSection id="switch" number="03" title="Switch configuration">
        <Subsection label="A" title="Unused access ports">
          <GuideText>
            Apply this configuration to all ports except the trunk and laptop
            access port.
          </GuideText>
          <CommandBlock
            caption="unused ports"
            code={`interface range <unused-ports>
 switchport mode access
 switchport access vlan <assigned-vlan>
 switchport port-security
 switchport port-security maximum <value>
 switchport port-security violation <mode>
 shutdown`}
          />
          <Callout title="Important" tone="important">
            <p>The lab guidance specifies that unused ports should be shut down.</p>
          </Callout>
        </Subsection>

        <Subsection label="B" title="Laptop access port">
          <CommandBlock
            caption="laptop port"
            code={`interface <laptop-port>
 switchport mode access
 switchport access vlan <data-vlan>
 switchport port-security
 switchport port-security maximum <value>
 switchport port-security violation <mode>`}
          />
          <GuideText>Do not shut down the laptop port.</GuideText>
        </Subsection>

        <Subsection label="C" title="Router trunk port">
          <CommandBlock
            caption="trunk port"
            code={`interface <trunk-port>
 switchport mode trunk
 switchport trunk allowed vlan XX,99`}
          />
          <GuideText>The trunk must carry:</GuideText>
          <Bullets
            items={[
              <>
                Data VLAN <Mono>XX</Mono>
              </>,
              <>
                Management VLAN <Mono>99</Mono>
              </>,
            ]}
          />
        </Subsection>

        <Subsection label="D" title="Switch virtual interfaces">
          <CommandBlock
            caption="data vlan"
            code={`interface vlan XX
 description DATA
 ip address <data-svi-ip> <subnet-mask>`}
          />
          <CommandBlock
            caption="management vlan"
            code={`interface vlan 99
 description MANAGEMENT
 ip address 192.99.X.2 255.255.255.0`}
          />
          <CommandBlock
            caption="vlan 999"
            code={`interface vlan 999
 description <assigned-description>`}
          />
        </Subsection>

        <Subsection label="E" title="Default gateway">
          <GuideText>
            The switch&apos;s default gateway should point to the router&apos;s
            management VLAN address.
          </GuideText>
          <CommandBlock code="ip default-gateway <router-management-ip>" />
        </Subsection>

        <Subsection label="F" title="Basic housekeeping and SSH">
          <CommandBlock
            caption="housekeeping"
            code={`hostname <switch-hostname>
no ip domain-lookup
ip domain-name ArmyNet.mil
service password-encryption
banner motd #Authorized access only#
ip ssh version 2
crypto key generate rsa`}
          />
          <GuideText>Also configure the required:</GuideText>
          <Bullets
            items={[
              "Enable password or enable secret",
              "Console password",
              "VTY password or local login",
              "Remote-management settings",
            ]}
          />
        </Subsection>
      </GuideSection>

      <GuideSection
        id="router"
        number="04"
        title="Router configuration"
        summary="This is a router-on-a-stick configuration. One physical router interface is divided into subinterfaces for multiple VLANs."
      >
        <Subsection label="A" title="Data VLAN subinterface">
          <CommandBlock
            caption="data subinterface"
            code={`interface g0/0/X.XX
 description DATA
 encapsulation dot1Q XX
 ip address <data-gateway-ip> <subnet-mask>
 ip helper-address 10.0.0.10`}
          />
          <Callout title="Why ip helper-address">
            <p>
              DHCP clients send broadcasts, but the DHCP server is on another
              network. The router converts and forwards those DHCP broadcasts to
              the server at <Mono>10.0.0.10</Mono>.
            </p>
          </Callout>
        </Subsection>

        <Subsection label="B" title="Management VLAN subinterface">
          <CommandBlock
            caption="management subinterface"
            code={`interface g0/0/X.99
 description MANAGEMENT
 encapsulation dot1Q 99
 ip address <management-gateway-ip> <subnet-mask>`}
          />
        </Subsection>

        <Subsection label="C" title="Instructor-facing interface">
          <CommandBlock
            caption="instructor interface"
            code={`interface <instructor-facing-interface>
 description INSTRUCTOR
 ip address <assigned-ip> <subnet-mask>
 no shutdown`}
          />
          <GuideText>
            Make sure the physical router interface supporting the subinterfaces
            is also enabled.
          </GuideText>
          <CommandBlock
            code={`interface g0/0/X
 no shutdown`}
          />
        </Subsection>

        <Subsection label="D" title="OSPF">
          <GuideText>
            This lab uses OSPF process ID <Mono>100</Mono>.
          </GuideText>
          <CommandBlock
            caption="ospf"
            code={`router ospf 100
 router-id <router-id>
 passive-interface g0/0/X.XX
 passive-interface g0/0/X.99
 network <instructor-network> <wildcard-mask> area <area>
 network <data-network> <wildcard-mask> area <area>
 network <management-network> <wildcard-mask> area <area>`}
          />
          <Callout title="Why the VLAN interfaces are passive">
            <p>A passive interface:</p>
            <Bullets
              items={[
                "Advertises its connected network through OSPF",
                "Does not send OSPF hello packets",
                "Does not try to form an OSPF neighbor relationship with end devices",
              ]}
            />
          </Callout>
        </Subsection>

        <Subsection label="E" title="Router housekeeping">
          <GuideText>Configure:</GuideText>
          <Bullets
            items={[
              "Hostname",
              "Passwords",
              "Password encryption",
              "MOTD banner",
              "Remote management and SSH",
            ]}
          />
        </Subsection>
      </GuideSection>

      <GuideSection
        id="dns"
        number="05"
        title="DNS configuration"
        summary="Create a secondary forward lookup zone."
      >
        <Subsection label="A" title="Add the DNS server">
          <Steps
            items={[
              <>
                Open <strong className="font-medium text-foreground">DNS
                Manager</strong>.
              </>,
              <>
                Highlight or right-click{" "}
                <strong className="font-medium text-foreground">DNS</strong>.
              </>,
              <>
                Select{" "}
                <strong className="font-medium text-foreground">
                  Add Server
                </strong>
                .
              </>,
              "Enter the Domain Controller's IP address.",
              "Click OK.",
            ]}
          />
        </Subsection>

        <Subsection label="B" title="Create the secondary zone">
          <Steps
            items={[
              "Expand the DNS server.",
              <>
                Right-click{" "}
                <strong className="font-medium text-foreground">
                  Forward Lookup Zones
                </strong>
                .
              </>,
              <>
                Select{" "}
                <strong className="font-medium text-foreground">New Zone</strong>
                .
              </>,
              "Click Next.",
              <>
                Select{" "}
                <strong className="font-medium text-foreground">
                  Secondary Zone
                </strong>
                .
              </>,
              "Click Next.",
              <>
                Enter the zone name <Mono>ArmyNet.mil</Mono>.
              </>,
              <>
                Enter the master DNS server IP <Mono>10.0.0.10</Mono>.
              </>,
              "Click Next, then Finish.",
            ]}
          />
        </Subsection>

        <Subsection label="C" title="Allow zone transfers">
          <GuideText>On the server hosting the primary zone:</GuideText>
          <Steps
            items={[
              <>
                Highlight the <Mono>ArmyNet.mil</Mono> zone.
              </>,
              <>
                Right-click it and select{" "}
                <strong className="font-medium text-foreground">
                  Properties
                </strong>
                .
              </>,
              <>
                Open the{" "}
                <strong className="font-medium text-foreground">
                  Zone Transfers
                </strong>{" "}
                tab.
              </>,
              <>
                Check{" "}
                <strong className="font-medium text-foreground">
                  Allow zone transfers
                </strong>
                .
              </>,
              "Click Apply, then OK.",
            ]}
          />
          <Callout title="Note">
            <p>
              Without zone transfers, a secondary DNS server cannot receive a
              copy of the zone data.
            </p>
          </Callout>
        </Subsection>
      </GuideSection>

      <GuideSection id="dhcp" number="06" title="DHCP configuration">
        <Callout title="Important" tone="important">
          <p>
            <Mono>X</Mono> represents your station number.
          </p>
        </Callout>

        <Subsection label="A" title="Authorize and connect to the server">
          <Steps
            items={[
              <>
                Open{" "}
                <strong className="font-medium text-foreground">
                  DHCP Manager
                </strong>
                .
              </>,
              <>
                Right-click DHCP and select{" "}
                <strong className="font-medium text-foreground">
                  Authorize
                </strong>{" "}
                if it is unauthorized.
              </>,
              <>
                Right-click DHCP and select{" "}
                <strong className="font-medium text-foreground">
                  Add Server
                </strong>
                .
              </>,
              "Enter the Domain Controller's IP.",
              "Click OK.",
            ]}
          />
        </Subsection>

        <Subsection label="B" title="Create the IPv4 scope">
          <Steps
            items={[
              "Expand the DHCP server.",
              <>
                Right-click{" "}
                <strong className="font-medium text-foreground">IPv4</strong>.
              </>,
              <>
                Select{" "}
                <strong className="font-medium text-foreground">
                  New Scope
                </strong>
                .
              </>,
              <>
                Name the scope <Mono>Station X – DHCP</Mono>.
              </>,
            ]}
          />
        </Subsection>

        <Subsection label="C" title="Address range">
          <CommandBlock
            caption="scope range"
            code={`Starting IP: 192.100.X.1
Ending IP:   192.100.X.254
Subnet mask: 255.255.255.0`}
          />
        </Subsection>

        <Subsection label="D" title="Exclusions and reservations">
          <GuideText>
            The lab uses an exclusion beginning at{" "}
            <Mono>192.100.X.1</Mono> and ending at an instructor-assigned host
            number <Mono>192.100.X.XX</Mono>.
          </GuideText>
          <GuideText>
            Use this exclusion range to protect addresses assigned to
            infrastructure, such as:
          </GuideText>
          <Bullets
            items={[
              "Router/default gateway",
              "Servers",
              "Printers or other statically addressed devices",
              "Reserved systems",
            ]}
          />
        </Subsection>

        <Subsection label="E" title="Lease duration">
          <GuideText>
            Set the lease duration to <Mono>1 day</Mono>.
          </GuideText>
        </Subsection>

        <Subsection label="F" title="DHCP options">
          <FieldTable
            columns={["Option", "Value"]}
            rows={[
              ["Router / default gateway", "192.100.X.1"],
              [
                "DNS",
                "Already populated — verify it points to the correct DNS/DC server.",
              ],
              ["WINS", "Enter the Domain Controller's IP address and click Add."],
            ]}
            monoFirstColumn={false}
          />
        </Subsection>

        <Subsection label="G" title="Activate the scope">
          <Steps
            items={[
              <>
                Select{" "}
                <strong className="font-medium text-foreground">
                  Yes, activate this scope now
                </strong>
                .
              </>,
              "Click Next.",
              "Click Finish.",
            ]}
          />
        </Subsection>

        <Subsection label="H" title="Configure the laptop">
          <GuideText>
            After DHCP setup is complete, configure the laptop&apos;s adapter to:
          </GuideText>
          <CommandBlock
            copyable={false}
            code={`Obtain an IP address automatically
Obtain a DNS server address automatically`}
          />
          <Callout title="Important" tone="important">
            <p>Do not forget this step before testing DHCP.</p>
          </Callout>
        </Subsection>
      </GuideSection>

      <GuideSection
        id="ou-structure"
        number="07"
        title="Organizational unit structure"
        summary="DC means Domain Controller. Create the following structure in Active Directory Users and Computers."
      >
        <CommandBlock code={OU_TREE} caption="OU hierarchy" copyable={false} />
        <GuideText>
          This separates user accounts from computer accounts and then organizes
          them by section.
        </GuideText>
      </GuideSection>

      <GuideSection id="user-naming" number="08" title="User naming standards">
        <Subsection label="A" title="Full name and display name">
          <CommandBlock
            caption="format"
            copyable={false}
            code={`LAST, First MI RANK/CIV

Military example:  <Last>, <First> <MI> <Rank>
Civilian example:  <Last>, <First> <MI> CIV`}
          />
          <GuideText>Use:</GuideText>
          <Bullets
            items={[
              "The person's military rank for military users",
              <>
                <Mono>CIV</Mono> for civilian or GS users
              </>,
            ]}
          />
          <GuideText>
            The displayed name and the name shown outside the user object should
            match.
          </GuideText>
        </Subsection>

        <Subsection label="B" title="User logon name">
          <CommandBlock
            caption="format"
            copyable={false}
            code={`first.mi.last.mil
first.mi.last.civ`}
          />
          <GuideText>
            Use lowercase letters and periods between each portion.
          </GuideText>
        </Subsection>
      </GuideSection>

      <GuideSection id="user-properties" number="09" title="User properties">
        <Subsection label="A" title="General tab">
          <FieldTable
            columns={["Field", "Example"]}
            rows={[
              ["First name", "<First>"],
              ["Initial", "<MI>"],
              ["Last name", "<Last>"],
              ["Display name", "<Last>, <First> <MI> <Rank/CIV>"],
              ["Description", "<Authorized role / rank>"],
              ["Office", "<Authorized unit / section>"],
              ["Telephone", "<Authorized contact number>"],
              ["Email", "Leave blank"],
              ["Web page", "Leave blank"],
            ]}
            monoFirstColumn={false}
          />
          <Callout title="SAAR references">
            <Bullets
              items={[
                <>
                  <strong className="font-medium text-foreground">
                    Description:
                  </strong>{" "}
                  use Block 6 of the SAAR
                </>,
                <>
                  <strong className="font-medium text-foreground">
                    Telephone:
                  </strong>{" "}
                  use Block 4 of the SAAR
                </>,
                <>
                  <strong className="font-medium text-foreground">
                    Section/OU membership:
                  </strong>{" "}
                  use Block 13
                </>,
              ]}
            />
            <p>
              The course notes state that the email field will automatically populate
              after the user is added to the appropriate system.
            </p>
          </Callout>
        </Subsection>

        <Subsection label="B" title="Address tab">
          <CommandBlock
            caption="address"
            copyable={false}
            code={`Street:   <Authorized street / building>
City:     <City>
State:    <State>
ZIP:      <ZIP code>
Country:  <Country>
PO Box:   Leave empty if not required`}
          />
        </Subsection>

        <Subsection label="C" title="Member Of tab">
          <Steps
            items={[
              "Click Add.",
              "Enter the first letter or number of the unit/group.",
              "Click Check Names.",
              <>
                Select either <Mono>S1</Mono> or <Mono>S6</Mono>, depending on
                Block 13 of the user&apos;s SAAR.
              </>,
              "Click OK.",
              "Click OK again.",
              "Click Apply.",
            ]}
          />
        </Subsection>

        <Subsection label="D" title="Account tab">
          <Steps
            items={[
              <>
                Locate{" "}
                <strong className="font-medium text-foreground">
                  Account expires
                </strong>
                .
              </>,
              "Set the expiration date to the authorized date from the source paperwork or instructor.",
            ]}
          />
        </Subsection>
      </GuideSection>

      <GuideSection
        id="verification"
        number="10"
        title="Final verification checklist"
        summary="Work through each area before calling the lab complete."
      >
        <VerificationChecklist />
      </GuideSection>

    </div>
  )
}
