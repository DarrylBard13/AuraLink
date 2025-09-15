import React, { useState, useEffect, useCallback } from "react";
import { Subscription, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import SubscriptionForm from "../components/subscriptions/SubscriptionForm";
import SubscriptionCard from "../components/subscriptions/SubscriptionCard";
import SubscriptionStats from "../components/subscriptions/SubscriptionStats";
import PageErrorBoundary from "../components/common/PageErrorBoundary";
import SubscriptionDetailsDialog from "../components/subscriptions/SubscriptionDetailsDialog";
import { toast } from "sonner";

// <SubscriptionsPageContent>
function SubscriptionsPageContent() {
  // <Hooks & State>
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  const [detailsSubscription, setDetailsSubscription] = useState(null);

  // <Data Loading & Lifecycle>
  const loadSubscriptions = useCallback(async () => {
    try {
      const data = await Subscription.list("-created_date");
      setSubscriptions(data);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUserRole(currentUser.role || 'user');
      } catch (e) {
        console.error("Failed to fetch user", e);
        setUserRole('user');
      }
    };
    fetchUser();
    loadSubscriptions();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('add') === 'true') {
      setEditingSubscription(null);
      setShowForm(true);
    }
  }, [loadSubscriptions]);

  // <Event Handlers>
  const handleSubmit = async (subscriptionData) => {
    try {
      if (editingSubscription) {
        await Subscription.update(editingSubscription.id, subscriptionData);
      } else {
        await Subscription.create(subscriptionData);
      }
      setShowForm(false);
      setEditingSubscription(null);
      loadSubscriptions();
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubscription(null);
  };

  const handleMarkPaid = async (subscription, paid) => {
    try {
      const updatedData = {
        ...subscription,
        paidThisCycle: paid,
        paidAt: paid ? new Date().toISOString() : null
      };
      await Subscription.update(subscription.id, updatedData);
      loadSubscriptions();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleMarkAllPaid = async () => {
    try {
      const visibleSubscriptions = filteredSubscriptions;
      const unpaidSubscriptions = visibleSubscriptions.filter((sub) => !sub.paidThisCycle);

      await Promise.all(unpaidSubscriptions.map((sub) =>
        Subscription.update(sub.id, {
          ...sub,
          paidThisCycle: true,
          paidAt: new Date().toISOString()
        })
      ));

      loadSubscriptions();
    } catch (error) {
      console.error("Error marking all as paid:", error);
    }
  };

  const handleViewDetails = (subscription) => {
    setDetailsSubscription(subscription);
  };

  const handleStatusChange = async (subscription, status) => {
    try {
      await Subscription.update(subscription.id, { status });
      toast.success(`Subscription "${subscription.name}" has been ${status}.`);
      loadSubscriptions();
    } catch (error) {
      console.error(`Failed to update subscription status:`, error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  // <Filtering Logic>
  const getFilteredSubscriptions = () => {
    let filtered;

    switch (filterTab) {
      case 'unpaid':
        filtered = subscriptions.filter((sub) => sub.status === 'active' && !sub.paidThisCycle);
        break;
      case 'paid':
        filtered = subscriptions.filter((sub) => sub.status === 'active' && sub.paidThisCycle);
        break;
      case 'paused':
        filtered = subscriptions.filter((sub) => sub.status === 'paused');
        break;
      case 'cancelled':
        filtered = subscriptions.filter((sub) => sub.status === 'cancelled');
        break;
      case 'all':
      default:
        filtered = subscriptions.filter((sub) => sub.status === 'active');
        break;
    }

    return filtered.filter((sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredSubscriptions = getFilteredSubscriptions();
  const unpaidVisible = filteredSubscriptions.filter((sub) => !sub.paidThisCycle);
  const isAdmin = userRole === 'admin';

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const unpaidActiveSubs = activeSubs.filter((s) => !s.paidThisCycle);
  const paidActiveSubs = activeSubs.filter((s) => s.paidThisCycle);
  const pausedSubs = subscriptions.filter((s) => s.status === 'paused');
  const cancelledSubs = subscriptions.filter((s) => s.status === 'cancelled');

  // <Render>
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subscriptions</h1>
          <p className="text-white/80">Track payments and manage recurring subscriptions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {isAdmin && unpaidVisible.length > 0 && (
            <Button
              onClick={handleMarkAllPaid}
              variant="outline"
              className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Mark All Paid
            </Button>
          )}
          {isAdmin && (
            <Button
              onClick={() => { setEditingSubscription(null); setShowForm(true); }}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          )}
        </div>
      </motion.div>

      <SubscriptionStats subscriptions={subscriptions} loading={loading} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-white self-start">Manage Subscriptions</h2>
          <div className="relative w-full md:w-auto md:flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <Tabs value={filterTab} onValueChange={setFilterTab}>
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/20 text-white">
                Active <span className="hidden sm:inline ml-1">({activeSubs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="unpaid" className="data-[state=active]:bg-white/20 text-white">
                Unpaid <span className="hidden sm:inline ml-1">({unpaidActiveSubs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="paid" className="data-[state=active]:bg-white/20 text-white">
                Paid <span className="hidden sm:inline ml-1">({paidActiveSubs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="paused" className="data-[state=active]:bg-white/20 text-white">
                Paused <span className="hidden sm:inline ml-1">({pausedSubs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="data-[state=active]:bg-white/20 text-white">
                Cancelled <span className="hidden sm:inline ml-1">({cancelledSubs.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {isAdmin && (
        <Dialog open={showForm} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
          <DialogContent className="glass-panel text-white border-white/20 max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingSubscription ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 max-h-[calc(90vh-120px)] overflow-y-auto">
              <SubscriptionForm
                subscription={editingSubscription}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/20 rounded mb-3 w-3/4"></div>
                <div className="h-8 bg-white/20 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-white/20 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? "No subscriptions found" : "No subscriptions yet"}
              </h3>
              <p className="text-white/60 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or filter settings"
                  : "Start tracking your subscriptions to manage your recurring expenses"
                }
              </p>
              {isAdmin && !searchTerm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Subscription
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={isAdmin ? handleEdit : null}
                onMarkPaid={isAdmin ? handleMarkPaid : null}
                onViewDetails={handleViewDetails}
                onStatusChange={isAdmin ? handleStatusChange : null}
              />
            ))}
          </div>
        )}
      </motion.div>

      {detailsSubscription && (
        <SubscriptionDetailsDialog
          subscription={detailsSubscription}
          onClose={() => setDetailsSubscription(null)}
        />
      )}

      <style jsx>{`
        .glass-panel[role="dialog"] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
        }
        [data-radix-scroll-area-viewport] {
          max-height: inherit !important;
        }
        @media (max-width: 640px) {
          .glass-panel[role="dialog"] {
            width: 95vw !important;
            max-width: 95vw !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

// <Subscriptions>
export default function Subscriptions() {
  return (
    <PageErrorBoundary pageName="Subscriptions">
      <SubscriptionsPageContent />
    </PageErrorBoundary>
  );
}

/*
Suggestions:
- NONE as of 09/07/2025
*/