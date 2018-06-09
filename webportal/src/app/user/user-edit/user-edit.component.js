// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// module dependencies
const breadcrumbComponent = require('../../job/breadcrumb/breadcrumb.component.ejs');
const userEditComponent = require('./user-edit.component.ejs');
const webportalConfig = require('../../config/webportal.config.json');
const userAuth = require('../user-auth/user-auth.component');
const url = require('url');
require('./user-edit.component.scss');


const userEditHtml = userEditComponent({
  breadcrumb: breadcrumbComponent,
});

$('#content-wrapper').html(userEditHtml);

$('#form-update-account').on('submit', (e) => {
  e.preventDefault();
  const username = $('#form-update-account :input[name=username]').val();
  const password = $('#form-update-account :input[name=password]').val();
  const admin = $('#form-update-account :input[name=admin]').is(':checked') ? true : false;
  userAuth.checkToken((token) => {
    $.ajax({
      url: `${webportalConfig.restServerUri}/api/v1/user`,
      data: {
        username,
        password,
        admin: admin,
        modify: true,
      },
      type: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      dataType: 'json',
      success: (data) => {
        if (data.error) {
          alert(data.message);
        } else {
          if (admin) {
            $.ajax({
              url: `${webportalConfig.restServerUri}/api/v1/user/${username}/virtualClusters`,
              data: {
                virtualClusters: '',
              },
              type: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              dataType: 'json',
              success: (updateVcData) => {
                $('#form-update-account').trigger('reset');
                if (updateVcData.error) {
                  alert(updateVcData.message);
                } else {
                  alert('Update user basic information successfully');
                }
              },
              error: (xhr, textStatus, error) => {
                $('#form-update-account').trigger('reset');
                const res = JSON.parse(xhr.responseText);
                alert(res.message);
              },
            });
          } else {
            $('#form-update-account').trigger('reset');
            alert('Update user basic information successfully');
          }
        }
      },
      error: (xhr, textStatus, error) => {
        $('#form-update-account').trigger('reset');
        const res = JSON.parse(xhr.responseText);
        alert(res.message);
      },
    });
  });
});


$('#form-update-virtual-cluster').on('submit', (e) => {
  e.preventDefault();
  const username = $('#form-update-virtual-cluster :input[name=username]').val();
  const virtualCluster = $('#form-update-virtual-cluster :input[name=virtualCluster]').val();
  userAuth.checkToken((token) => {
    $.ajax({
      url: `${webportalConfig.restServerUri}/api/v1/user/${username}/virtualClusters`,
      data: {
        virtualClusters: virtualCluster,
      },
      type: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      dataType: 'json',
      success: (data) => {
        $('#form-update-virtual-cluster').trigger('reset');
        if (data.error) {
          alert(data.message);
        } else {
          alert('Update user information successfully');
        }
      },
      error: (xhr, textStatus, error) => {
        $('#form-update-virtual-cluster').trigger('reset');
        const res = JSON.parse(xhr.responseText);
        alert(res.message);
      },
    });
  });
});

const loadContent = (query) => {
  console.log('in load content');
  $('#update-account-input-username').value = query['userName'];
  $('#update-virtual-cluster-input-virtualCluster').value=query['vcList'];
  //$('#form-update-account :input[name=admin]').is(':checked') = query['isAdmin'] == 'true' ? true : false;
}


$(document).ready(() => {
  $('#sidebar-menu--cluster-view').addClass('active');
  $('#sidebar-menu--cluster-view--user-management').addClass('active');

  const query = url.parse(window.location.href, true).query;
  loadContent(query);
});