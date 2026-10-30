class Listing {
  const Listing({
    required this.id,
    required this.name,
    required this.slug,
    required this.category,
    required this.summary,
    required this.region,
    required this.websiteUrl,
    required this.sourceUrl,
    this.countryCode,
    this.verifiedAt,
  });

  final String id, name, slug, category, summary, region, websiteUrl, sourceUrl;
  final String? countryCode, verifiedAt;

  factory Listing.fromJson(Map<String, dynamic> json) {
    String requiredString(String key) {
      final value = json[key];
      if (value is! String || value.trim().isEmpty) {
        throw FormatException('Invalid listing field: $key');
      }
      return value;
    }

    String httpsUrl(String key) {
      final value = requiredString(key);
      final uri = Uri.tryParse(value);
      if (uri == null || uri.scheme != 'https' || uri.host.isEmpty) {
        throw FormatException('Invalid HTTPS URL: $key');
      }
      return value;
    }

    final country = json['country_code'];
    final verified = json['verified_at'];
    if (country != null && country is! String) throw const FormatException('Invalid country_code');
    if (verified != null && verified is! String) throw const FormatException('Invalid verified_at');

    return Listing(
      id: requiredString('id'),
      name: requiredString('name'),
      slug: requiredString('slug'),
      category: requiredString('category'),
      summary: requiredString('summary'),
      region: requiredString('region'),
      websiteUrl: httpsUrl('website_url'),
      sourceUrl: httpsUrl('source_url'),
      countryCode: country as String?,
      verifiedAt: verified as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'slug': slug, 'category': category,
    'summary': summary, 'region': region, 'website_url': websiteUrl,
    'source_url': sourceUrl, 'country_code': countryCode, 'verified_at': verifiedAt,
  };
}
