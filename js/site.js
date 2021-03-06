var $searchForm = $('.hdr-search-form');
var $searchFormCloseBtn = $searchForm.find('.close');
var $searchFormIcon = $('.hdr-search-icon');
var $searchInput = $searchForm.find('input[type="search"]');

var submitHdrSearch = function() {
    $searchForm.on('submit', function(e) {
        e.preventDefault();
        $searchForm.addClass('submitted');

        $searchInput.parents('.form-group').removeClass('has-error').removeClass('has-feedback');
        if (!$searchInput.val()) {
            $searchInput.parents('.form-group').addClass('has-error').addClass('has-feedback');
        } else {
            var newurl = '/search/?q=' + encodeURIComponent($searchInput.val());
            var product = $('body').attr('data-product');
            var filterSite = $('#filterSite').is(':checked');

            if (!filterSite && product) {
                newurl += '&product=' + encodeURIComponent(product);
            }
            window.location.href = newurl;
        }
    });
};
var showHdrSearchForm = function() {
    $searchFormIcon.on('click', function() {
        $searchFormIcon.addClass('hidden');
        $searchForm.removeClass('hidden');
        $searchInput.focus().parents('.form-group').removeClass('has-error').removeClass('has-feedback');
    });

    $searchInput.on('input', function() {
        if ($searchForm.hasClass('submitted') && !$searchInput.val()) {
            $searchInput.parents('.form-group').addClass('has-error').addClass('has-feedback');
        } else {
            $searchInput.parents('.form-group').removeClass('has-error').removeClass('has-feedback');
        }
    });

    // Setup click handler to close searh form
    $('body').on('click', function(e) {
        if (
            // clicked search close button
        ($searchFormCloseBtn.is(e.target) || $searchFormCloseBtn.has(e.target).length) ||
        // not search form and not the search icon
        ((!$searchForm.is(e.target) && !$searchForm.has(e.target).length) && (!$searchFormIcon.is(e.target) && !$searchFormIcon.has(e.target).length))
        ) {
            $searchFormIcon.removeClass('hidden');
            $searchForm.addClass('hidden');
        }
    });
};

var handleSearch = function() {
    var getParameterByName = function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };

    var queryParam = getParameterByName('q');

    if (queryParam) {
        $('#query').parents('.form-group').removeClass('has-error').removeClass('has-feedback');
        $('#query').val(queryParam);

        var productfacet = getParameterByName('product');
        var doctypefacet = getParameterByName('doctype');

        $('#product-facet').val(productfacet);
        $('#doctype-facet').val(doctypefacet);

        productfacet = productfacet ? productfacet.toLowerCase() : null;
        doctypefacet = doctypefacet ? doctypefacet.toLowerCase() : null;

        var client = algoliasearch('19A6FWAAB3', 'a480e1583c97f14a6ad92c7c605d9f23');
        var index = client.initIndex('developer-dot');
        var facets = [];

        if (productfacet) {
            facets.push('product:' + productfacet);
        }
        if (doctypefacet) {
            facets.push('doctype:' + doctypefacet);
        }

        index.search(queryParam, {
            attributesToRetrieve: ['title', 'url', 'text', 'product', 'doctype'],
            hitsPerPage: 10,
            facetFilters: facets,
        }, function searchDone(err, content) {
            var $searchResults = $('#search-results');

            if (err || (!content || !content.hits || !content.hits.length)) {
                if (err) {
                    console.error(err);
                }
                $searchResults.html('<h5>No Results Found</h5>');
            } else {
                content.hits.forEach(function(result) {
                    $searchResults.append('<h5><a href="' + result.url + '">' + result.title + '</a></h5><p>' + result.text + '<br />Product: ' + result.product + '<br />Doctype: ' + result.doctype + '</p>');
                });
            }
        });
    }

    var $searchPageForm = $('.search-form');

    $('#query').on('input', function() {
        if ($searchPageForm.hasClass('submitted') && !$(this).val()) {
            $(this).parents('.form-group').addClass('has-error').addClass('has-feedback');
        } else {
            $(this).parents('.form-group').removeClass('has-error').removeClass('has-feedback');
        }
    });

    $searchPageForm.submit(function(e) {
        e.preventDefault();
        $(this).addClass('submitted');

        $('#query').parents('.form-group').removeClass('has-error').removeClass('has-feedback');
        if (!$('#query').val()) {
            $('#query').parents('.form-group').addClass('has-error').addClass('has-feedback');
        } else {
            var newurl = '/search/?q=' + encodeURIComponent($('#query').val());

            if ($('#product-facet').val()) {
                newurl += '&product=' + encodeURIComponent($('#product-facet').val());
            }
            if ($('#doctype-facet').val()) {
                newurl += '&doctype=' + encodeURIComponent($('#doctype-facet').val());
            }

            location.href = newurl;
        }
    });

};

var setupAvaForm = function() {
    var avaform = new Avaform({
        profiles: "default",
        _parent: "",
        button_label: "Get Started",
        form_name: "APIFreeTrialContactForm",
        campaign_name: "",
        campaign_id: "70140000000TsVb",
        lsmr: "",
        lso: "Marketing",
        lead_status: "prospect",
        type: "customer",
        opp_type: "new",
        opp_subtype: "SDK",
        erp: "",
        poi: "",
        pos: "",
        ecommerce: "",
        callback: function() {},
        showerrors: "1",
        fullname: "1",
        v: "3",
        a15: "dev",
        usphone: "true",
        goal_type: "goal6_autoprovisioning",
        redirecturl: "",
        poi_menu: "false",
        profile: "getting-started",
        query_string: "referrer=&lastReferrer=developer.avalara.com",
        container: ".avaform-wrapper",
        referer: "http://developer.avalara.com/"
    });
};

var fixApiRefNav = function() {
    if ($('#the-nav li').length >= 22) {
        $('#the-nav').data('offset-bottom', '160');
    }
};

var fixDropDownMenuLargePosition = function() {
    setTimeout(function() {
        $('.dropdown-large').each(function() {
            var left = $(this).position().left;

            $(this).find('.dropdown-menu-large').css('left', left);
        });
    }, 100);
};

$(document).ready(function() {
    fixApiRefNav();

    submitHdrSearch();
    showHdrSearchForm();

    fixDropDownMenuLargePosition();
});
