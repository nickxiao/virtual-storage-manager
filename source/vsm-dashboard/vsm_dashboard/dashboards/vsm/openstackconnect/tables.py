# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2014 Intel Corporation, All Rights Reserved.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

import logging
from django.template.defaultfilters import filesizeformat
from django.utils.translation import ugettext_lazy as _
from django.utils.datastructures import SortedDict
from django import forms

from django.utils.safestring import mark_safe
#from vsm_dashboard.dashboards.admin.instances.tables import \
#        AdminUpdateRow

from horizon import tables
from horizon.utils import html
from horizon import exceptions
from vsm_dashboard.api import vsm as vsmapi

from .utils import checkbox_transform

STRING_SEPARATOR = "__"
LOG = logging.getLogger(__name__)

class AddOpenstackIPAction(tables.LinkAction):
    name = "add openstack ip"
    verbose_name = _("Add OpenStack Nova Controller")
    url = "horizon:vsm:openstackconnect:create"
    classes = ("ajax-modal", "btn-create")

    def allowed(self, request, datum):
        return not len(vsmapi.appnode_list(request))

class DelOpenstackIPAction(tables.DeleteAction):
    data_type_singular = ("IP")
    data_type_plural = ("IPs")
    classes = ("btn-delopenstackip",)

    def allowed(self, request, datum):
        return False # disable delete
        LOG.error("CEPH_LOG DELOPENSTACKIP: ALLOW")
        LOG.error(datum)
        return True

    def delete(self, request, obj_id):
        LOG.error("CEPH_LOG DELOPENSTACKIP: DELETE")
        LOG.error(obj_id)
        vsmapi.del_appnode(request, obj_id)

class EditOpenstackIPAction(tables.LinkAction):
    name = "edit openstack ip"
    verbose_name = _("Edit")
    url = "horizon:vsm:openstackconnect:update"
    classes = ("ajax-modal", "btn-edit")

    def allowed(self, request, datum):
        return len([x for x in vsmapi.pool_usages(request) if x.attach_status=="success"]) == 0

class ListOpenstackIPTable(tables.DataTable):

    id = tables.Column("id", verbose_name=_("ID"), classes=("ip_list",), hidden=True)
    ip = tables.Column("ip", verbose_name=_("IP"))
    ssh_status = tables.Column("ssh_status", verbose_name=_("Connection Status"))
    log_info = tables.Column("log_info", verbose_name=_("LOG INFO"))

    class Meta:
        name = "openstack_ip_list"
        verbose_name = _("Manage Openstack Access")
        table_actions = (AddOpenstackIPAction, DelOpenstackIPAction)
        row_actions = (EditOpenstackIPAction,)

    def get_object_id(self, datum):
        if hasattr(datum, "id"):
            return datum.id
        else:
            return datum["id"]

    def get_object_display(self, datum):
        if hasattr(datum, "ip"):
            return datum.id
        else:
            return datum["ip"]
