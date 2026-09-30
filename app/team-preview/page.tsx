"use client";

import { useState } from "react";
import styles from "./team-preview.module.css";

const workspaces = [
  { initials: "SP", name: "Selangor Properties", detail: "4 members · 12 properties", color: "green", selected: true },
  { initials: "NW", name: "Northwind Retail Group", detail: "3 members · 8 properties", color: "blue", selected: false },
  { initials: "AM", name: "Aster Management", detail: "2 members · 5 properties", color: "purple", selected: false },
];

const members = [
  { initials: "FM", name: "Farah Malik", email: "farah@example.com", role: "Owner", color: "green", status: "Active" },
  { initials: "JC", name: "Jason Chong", email: "jason@example.com", role: "Finance admin", color: "blue", status: "Active" },
  { initials: "AN", name: "Aina Noor", email: "aina@example.com", role: "Finance member", color: "peach", status: "Active" },
  { initials: "RK", name: "Ravi Kumar", email: "ravi@example.com", role: "Viewer", color: "purple", status: "Invited" },
];

export default function TeamPreview() {
  const [screen, setScreen] = useState<"workspaces" | "team">("workspaces");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <main className={styles.preview}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span className={styles.brandMark}>↗</span> bank recon</div>
        <div className={styles.orgSwitcher}>
          <span className={`${styles.avatar} ${styles.green}`}>SP</span>
          <span className={styles.orgName}><strong>Selangor Properties</strong><small>Finance workspace</small></span>
          <span className={styles.chevron}>⌄</span>
        </div>
        <span className={styles.navLabel}>WORKSPACE</span>
        <button className={styles.navItem}><span>▦</span> Reconciliation</button>
        <button className={styles.navItem}><span>♧</span> Vendors &amp; tenants</button>
        <span className={styles.navLabel}>ADMINISTRATION</span>
        <button className={`${styles.navItem} ${screen === "workspaces" ? styles.active : ""}`} onClick={() => setScreen("workspaces")}><span>▣</span> Organizations</button>
        <button className={`${styles.navItem} ${screen === "team" ? styles.active : ""}`} onClick={() => setScreen("team")}><span>♙</span> Team &amp; access</button>
        <div className={styles.sideFooter}><span className={`${styles.avatar} ${styles.peach}`}>FM</span><span className={styles.orgName}><strong>Farah Malik</strong><small>Owner</small></span><span className={styles.chevron}>···</span></div>
      </aside>

      <section className={styles.main}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileBrand}><span className={styles.brandMark}>↗</span> bank recon</div>
          <button className={styles.mobileOrg} onClick={() => setCopied(true)}><span className={`${styles.avatar} ${styles.green}`}>SP</span><span><strong>Selangor Properties</strong><small>Finance workspace</small></span><span className={styles.chevron}>⌄</span></button>
        </div>
        <nav className={styles.mobileNav} aria-label="Team settings preview">
          <button className={screen === "workspaces" ? styles.mobileNavActive : ""} onClick={() => setScreen("workspaces")}>Organizations</button>
          <button className={screen === "team" ? styles.mobileNavActive : ""} onClick={() => setScreen("team")}>Team &amp; access</button>
        </nav>
        <header className={styles.topbar}>
          <div className={styles.crumb}>Selangor Properties <span>/</span> {screen === "workspaces" ? "Organizations" : "Team & access"}</div>
          <div className={styles.topRight}><span className={styles.secure}><i /> Organization data is isolated</span><span className={`${styles.avatar} ${styles.peach}`}>FM</span></div>
        </header>

        <div className={styles.content}>
          <div className={styles.previewBanner}><span>✦</span><div><strong>Team workspaces · concept preview</strong><small>This mockup uses sample organizations and members. Changes here are not saved.</small></div><span className={styles.previewTag}>MOCKUP</span></div>

          {screen === "workspaces" ? <>
            <div className={styles.pageHeading}><div><span className={styles.eyebrow}>ORGANIZATION SETTINGS</span><h1>Your organizations</h1><p>Keep each company’s reconciliations, contacts, and team access in its own workspace.</p></div><button className={styles.primaryButton} onClick={() => setInviteOpen(true)}>＋ Create organization</button></div>
            <div className={styles.summaryStrip}><div><span className={styles.summaryIcon}>▣</span><span><small>Organizations you belong to</small><strong>3 workspaces</strong></span></div><div><span className={styles.summaryIcon}>♙</span><span><small>Your current role</small><strong>Owner · Selangor Properties</strong></span></div></div>
            <div className={styles.sectionHeading}><div><h2>Available workspaces</h2><p>Switching organizations changes the records you can access.</p></div><span className={styles.count}>3 organizations</span></div>
            <div className={styles.workspaceGrid}>{workspaces.map((workspace) => <article key={workspace.name} className={`${styles.workspaceCard} ${workspace.selected ? styles.selectedCard : ""}`}><div className={styles.cardTop}><span className={`${styles.avatar} ${styles[workspace.color]}`}>{workspace.initials}</span>{workspace.selected && <span className={styles.currentBadge}><i /> CURRENT</span>}</div><h3>{workspace.name}</h3><p>{workspace.detail}</p><div className={styles.cardBottom}><span className={styles.roleText}>{workspace.selected ? "Owner" : "Finance member"}</span><button className={workspace.selected ? styles.subtleButton : styles.outlineButton} onClick={() => setCopied(true)}>{workspace.selected ? "Current workspace" : "Open workspace →"}</button></div></article>)}</div>
            <div className={styles.isolationNote}><span>◈</span><p><strong>Your workspaces stay separate.</strong> A team member only sees records belonging to the organization they’ve opened.</p><button onClick={() => setScreen("team")}>Manage team access →</button></div>
          </> : <>
            <div className={styles.pageHeading}><div><span className={styles.eyebrow}>SELANGOR PROPERTIES</span><h1>Team &amp; access</h1><p>Invite colleagues and choose what they can do in this organization.</p></div><button className={styles.primaryButton} onClick={() => setInviteOpen(true)}>＋ Invite a teammate</button></div>
            <div className={styles.orgContext}><span className={`${styles.avatar} ${styles.green}`}>SP</span><div><strong>Selangor Properties</strong><small>4 seats · 3 active members · 1 invitation pending</small></div><span className={styles.ownerPill}>You’re the owner</span></div>
            <div className={styles.permissionCard}><div className={styles.permissionTitle}><span className={styles.lockIcon}>⌑</span><div><h2>Organization access</h2><p>Members only see data from this organization. Your other workspaces remain private to their members.</p></div></div><div className={styles.roleList}><div><span className={styles.roleDot}>O</span><span><strong>Owner</strong><small>Full control, billing, members, and financial records</small></span><b>1 member</b></div><div><span className={styles.roleDot}>A</span><span><strong>Finance admin</strong><small>Manage members and all reconciliation records</small></span><b>1 member</b></div><div><span className={styles.roleDot}>F</span><span><strong>Finance member</strong><small>Record transactions and reconcile monthly runs</small></span><b>1 member</b></div><div><span className={styles.roleDot}>V</span><span><strong>Viewer</strong><small>View runs and reports without making changes</small></span><b>1 invited</b></div></div></div>
            <div className={styles.membersCard}><div className={styles.sectionHeading}><div><h2>Members</h2><p>People with access to Selangor Properties.</p></div><button className={styles.outlineButton} onClick={() => { void navigator.clipboard?.writeText("https://bank-recon.example/invite/selangor"); setCopied(true); }}>Copy invite link</button></div><div className={styles.tableHead}><span>MEMBER</span><span>ROLE</span><span>STATUS</span><span /></div>{members.map((member) => <div className={styles.memberRow} key={member.email}><div className={styles.memberIdentity}><span className={`${styles.avatar} ${styles[member.color]}`}>{member.initials}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div><span className={styles.memberRole}>{member.role}</span><span className={member.status === "Active" ? styles.statusActive : styles.statusInvited}>{member.status === "Active" ? "●" : "◷"} {member.status}</span><button className={styles.moreButton} aria-label={`More actions for ${member.name}`}>···</button></div>)}</div>
            <div className={styles.footnote}><span>ⓘ</span> Role changes and invitations will be managed by organization owners and admins.</div>
          </>}
        </div>
      </section>

      {copied && <div className={styles.toast} role="status">Preview action · no changes were saved <button onClick={() => setCopied(false)} aria-label="Dismiss">×</button></div>}
      {inviteOpen && <div className={styles.backdrop} role="presentation" onClick={() => setInviteOpen(false)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="invite-title" onClick={(event) => event.stopPropagation()}><div className={styles.modalHead}><div><span className={styles.eyebrow}>SELANGOR PROPERTIES</span><h2 id="invite-title">Invite a teammate</h2></div><button className={styles.closeButton} onClick={() => setInviteOpen(false)} aria-label="Close">×</button></div><p className={styles.modalIntro}>Give a teammate access to this organization. You can change their role later.</p><label className={styles.field}>Work email<input type="email" placeholder="name@company.com" /></label><label className={styles.field}>Role<select defaultValue="Finance member"><option>Finance member</option><option>Finance admin</option><option>Viewer</option></select></label><div className={styles.roleHint}><span>ⓘ</span> This teammate will only have access to Selangor Properties.</div><div className={styles.modalButtons}><button className={styles.outlineButton} onClick={() => setInviteOpen(false)}>Cancel</button><button className={styles.primaryButton} onClick={() => { setInviteOpen(false); setCopied(true); }}>Send invitation</button></div></section></div>}
    </main>
  );
}
