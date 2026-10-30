import 'package:flutter_test/flutter_test.dart';
import 'package:furfinder_mobile/listing.dart';

void main() {
  final valid = <String, dynamic>{
    'id': 'listing-1', 'name': 'Example Community', 'slug': 'example-community',
    'category': 'community', 'summary': 'A public community listing.',
    'region': 'Asia-Pacific', 'country_code': 'ID',
    'website_url': 'https://example.org', 'source_url': 'https://example.org/about',
    'verified_at': null,
  };

  test('parses a valid public listing', () {
    final listing = Listing.fromJson(valid);
    expect(listing.name, 'Example Community');
    expect(listing.region, 'Asia-Pacific');
  });

  test('rejects non-HTTPS provenance links', () {
    expect(() => Listing.fromJson({...valid, 'source_url': 'http://example.org'}),
        throwsFormatException);
  });

  test('rejects missing required fields', () {
    final invalid = {...valid}..remove('summary');
    expect(() => Listing.fromJson(invalid), throwsFormatException);
  });

  test('cache serialization excludes private contact fields', () {
    final json = Listing.fromJson(valid).toJson();
    expect(json.containsKey('phone'), isFalse);
    expect(json.containsKey('home_address'), isFalse);
  });
}
