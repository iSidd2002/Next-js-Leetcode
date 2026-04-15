"use client"

import { useState, useMemo } from 'react';
import type { DevLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Plus, ExternalLink, Trash2, CheckCircle2, Circle,
  MoreVertical, Pencil, Search, Link as LinkIcon, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'dsa',           label: 'DSA',           color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { value: 'system-design', label: 'System Design',  color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { value: 'frontend',      label: 'Frontend',       color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { value: 'backend',       label: 'Backend',        color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  { value: 'tools',         label: 'Tools',          color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  { value: 'interview',     label: 'Interview',      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { value: 'other',         label: 'Other',          color: 'bg-muted text-muted-foreground border-border' },
] as const;

function getCategoryMeta(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string) {
  try {
    const origin = new URL(url).origin;
    return `${origin}/favicon.ico`;
  } catch {
    return null;
  }
}

interface FormState {
  url: string;
  title: string;
  description: string;
  category: DevLink['category'];
  tagInput: string;
  tags: string[];
}

const emptyForm = (): FormState => ({
  url: '',
  title: '',
  description: '',
  category: 'other',
  tagInput: '',
  tags: [],
});

interface DevLinksProps {
  links: DevLink[];
  onAdd: (data: Omit<DevLink, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<DevLink>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function DevLinks({ links, onAdd, onUpdate, onDelete }: DevLinksProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLink, setEditLink] = useState<DevLink | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  const openAdd = () => {
    setEditLink(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (link: DevLink) => {
    setEditLink(link);
    setForm({
      url: link.url,
      title: link.title,
      description: link.description ?? '',
      category: link.category,
      tagInput: '',
      tags: link.tags,
    });
    setDialogOpen(true);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = form.tagInput.trim();
      if (tag && !form.tags.includes(tag)) {
        setForm(f => ({ ...f, tags: [...f.tags, tag], tagInput: '' }));
      } else {
        setForm(f => ({ ...f, tagInput: '' }));
      }
    }
  };

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const handleSave = async () => {
    if (!form.url.trim() || !form.title.trim()) {
      toast.error('URL and title are required');
      return;
    }
    try { new URL(form.url.trim()); } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    setSaving(true);
    try {
      if (editLink) {
        await onUpdate(editLink.id, {
          url: form.url.trim(),
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          category: form.category,
          tags: form.tags,
        });
      } else {
        await onAdd({
          url: form.url.trim(),
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          category: form.category,
          tags: form.tags,
        });
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return links.filter(l => {
      if (filterCategory !== 'all' && l.category !== filterCategory) return false;
      if (filterRead === 'unread' && l.isRead) return false;
      if (filterRead === 'read' && !l.isRead) return false;
      if (q && !l.title.toLowerCase().includes(q) && !l.url.toLowerCase().includes(q) && !l.tags.some(t => t.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [links, search, filterCategory, filterRead]);

  const unreadCount = links.filter(l => !l.isRead).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Dev Links</h2>
          <p className="text-sm text-muted-foreground">
            {links.length} saved · {unreadCount} unread
          </p>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title, URL, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-9 w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRead} onValueChange={v => setFilterRead(v as typeof filterRead)}>
          <SelectTrigger className="h-9 w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LinkIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {links.length === 0 ? 'No links saved yet' : 'No links match your filters'}
          </p>
          {links.length === 0 && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              Click "Add Link" to save your first resource
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={() => openEdit(link)}
              onDelete={() => onDelete(link.id)}
              onToggleRead={() => onUpdate(link.id, { isRead: !link.isRead })}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editLink ? 'Edit Link' : 'Add Dev Link'}</DialogTitle>
            <DialogDescription className="sr-only">
              {editLink ? 'Edit the saved link' : 'Save a new dev resource link'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="dl-url">URL *</Label>
              <Input
                id="dl-url"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dl-title">Title *</Label>
              <Input
                id="dl-title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Neetcode 150 Roadmap"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dl-desc">Description</Label>
              <Textarea
                id="dl-desc"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What's this link about?"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dl-cat">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as DevLink['category'] }))}>
                <SelectTrigger id="dl-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dl-tags">Tags</Label>
              <Input
                id="dl-tags"
                value={form.tagInput}
                onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
              />
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editLink ? 'Save Changes' : 'Add Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface LinkCardProps {
  link: DevLink;
  onEdit: () => void;
  onDelete: () => void;
  onToggleRead: () => void;
}

function LinkCard({ link, onEdit, onDelete, onToggleRead }: LinkCardProps) {
  const [imgError, setImgError] = useState(false);
  const cat = getCategoryMeta(link.category);
  const domain = getDomain(link.url);
  const favicon = getFaviconUrl(link.url);

  return (
    <div className={cn(
      'group relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30',
      link.isRead && 'opacity-60'
    )}>
      {/* Top row: favicon + domain + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {favicon && !imgError ? (
            <img
              src={favicon}
              alt=""
              width={16}
              height={16}
              className="shrink-0 rounded-sm"
              onError={() => setImgError(true)}
            />
          ) : (
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground truncate">{domain}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleRead}
            title={link.isRead ? 'Mark unread' : 'Mark as read'}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.isRead
              ? <CheckCircle2 className="h-4 w-4 text-green-500" />
              : <Circle className="h-4 w-4" />
            }
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Open
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium leading-snug hover:text-primary hover:underline transition-colors line-clamp-2"
      >
        {link.title}
      </a>

      {/* Description */}
      {link.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{link.description}</p>
      )}

      {/* Footer: category + tags */}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-1">
        <Badge
          variant="outline"
          className={cn('text-[10px] px-1.5 py-0 h-4 font-medium border', cat.color)}
        >
          {cat.label}
        </Badge>
        {link.tags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            <Tag className="h-2.5 w-2.5 mr-0.5" />
            {tag}
          </Badge>
        ))}
        {link.tags.length > 3 && (
          <span className="text-[10px] text-muted-foreground">+{link.tags.length - 3}</span>
        )}
      </div>
    </div>
  );
}
